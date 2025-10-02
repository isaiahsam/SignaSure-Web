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
      version: 1,
      onCreate: _createDatabase,
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
        analysis TEXT
      )
    ''');
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
      },
      where: 'id = ?',
      whereArgs: [document.id],
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