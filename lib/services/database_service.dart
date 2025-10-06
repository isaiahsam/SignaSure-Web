import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as path;
import '../models/document.dart';

class DatabaseService {
  static Database? _database;
  static const String _tableName = 'documents';

  static Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  static Future<Database> _initDatabase() async {
    String dbPath = path.join(await getDatabasesPath(), 'signasure.db');
    return await openDatabase(
      dbPath,
      version: 2,
      onCreate: _createDatabase,
      onUpgrade: _upgradeDatabase,
    );
  }

  static Future<void> _createDatabase(Database db, int version) async {
    await db.execute('''
      CREATE TABLE $_tableName (
        id TEXT PRIMARY KEY,
        filePath TEXT NOT NULL,
        fileName TEXT NOT NULL,
        scanDate TEXT NOT NULL,
        type TEXT NOT NULL,
        extractedText TEXT,
        analysis TEXT,
        isFavorite INTEGER DEFAULT 0,
        customTitle TEXT
      )
    ''');
  }

  static Future<void> _upgradeDatabase(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      // Add new columns if they don't exist
      await db.execute('ALTER TABLE $_tableName ADD COLUMN isFavorite INTEGER DEFAULT 0');
      await db.execute('ALTER TABLE $_tableName ADD COLUMN customTitle TEXT');
    }
  }

  static Future<void> insertDocument(Document document) async {
    final db = await database;
    await db.insert(
      _tableName,
      {
        'id': document.id,
        'filePath': document.filePath,
        'fileName': document.fileName,
        'scanDate': document.scanDate.toIso8601String(),
        'type': document.type.toString(),
        'extractedText': document.extractedText,
        'analysis': document.analysis != null
            ? jsonEncode(document.analysis!.toJson())
            : null,
        'isFavorite': document.isFavorite ? 1 : 0,
        'customTitle': document.customTitle,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  static Future<List<Document>> getAllDocuments() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      _tableName,
      orderBy: 'scanDate DESC',
    );

    return List.generate(maps.length, (i) {
      final map = maps[i];
      return Document(
        id: map['id'],
        filePath: map['filePath'],
        fileName: map['fileName'],
        scanDate: DateTime.parse(map['scanDate']),
        type: DocumentType.values.firstWhere(
          (e) => e.toString() == map['type'],
          orElse: () => DocumentType.other,
        ),
        extractedText: map['extractedText'],
        analysis: map['analysis'] != null
            ? DocumentAnalysis.fromJson(jsonDecode(map['analysis']))
            : null,
        isFavorite: map['isFavorite'] == 1,
        customTitle: map['customTitle'],
      );
    });
  }

  static Future<Document?> getDocument(String id) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      _tableName,
      where: 'id = ?',
      whereArgs: [id],
    );

    if (maps.isNotEmpty) {
      final map = maps.first;
      return Document(
        id: map['id'],
        filePath: map['filePath'],
        fileName: map['fileName'],
        scanDate: DateTime.parse(map['scanDate']),
        type: DocumentType.values.firstWhere(
          (e) => e.toString() == map['type'],
          orElse: () => DocumentType.other,
        ),
        extractedText: map['extractedText'],
        analysis: map['analysis'] != null
            ? DocumentAnalysis.fromJson(jsonDecode(map['analysis']))
            : null,
        isFavorite: map['isFavorite'] == 1,
        customTitle: map['customTitle'],
      );
    }
    return null;
  }

  static Future<void> updateDocument(Document document) async {
    final db = await database;
    await db.update(
      _tableName,
      {
        'filePath': document.filePath,
        'fileName': document.fileName,
        'scanDate': document.scanDate.toIso8601String(),
        'type': document.type.toString(),
        'extractedText': document.extractedText,
        'analysis': document.analysis != null
            ? jsonEncode(document.analysis!.toJson())
            : null,
        'isFavorite': document.isFavorite ? 1 : 0,
        'customTitle': document.customTitle,
      },
      where: 'id = ?',
      whereArgs: [document.id],
    );
  }

  static Future<void> toggleFavorite(String id, bool isFavorite) async {
    final db = await database;
    await db.update(
      _tableName,
      {'isFavorite': isFavorite ? 1 : 0},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  static Future<void> updateTitle(String id, String? customTitle) async {
    final db = await database;
    await db.update(
      _tableName,
      {'customTitle': customTitle},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  static Future<void> deleteDocument(String id) async {
    final db = await database;
    await db.delete(
      _tableName,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  static Future<void> clearAllDocuments() async {
    final db = await database;
    await db.delete(_tableName);
  }
}