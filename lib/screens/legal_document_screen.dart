import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';

class LegalDocumentScreen extends StatelessWidget {
  final String title;
  final String assetPath;

  const LegalDocumentScreen({
    super.key,
    required this.title,
    required this.assetPath,
  });

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF121212) : const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: Text(title),
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: FutureBuilder<String>(
        future: rootBundle.loadString(assetPath),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 64,
                      color: Colors.red,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Error loading document',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      snapshot.error.toString(),
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            );
          }

          return _LegalDocumentContent(
            content: snapshot.data ?? '',
            isDark: isDark,
          );
        },
      ),
    );
  }
}

class _LegalDocumentContent extends StatelessWidget {
  final String content;
  final bool isDark;

  const _LegalDocumentContent({
    required this.content,
    required this.isDark,
  });

  List<_Section> _parseSections(String markdown) {
    final lines = markdown.split('\n');
    final sections = <_Section>[];
    String? currentSection;
    final currentContent = StringBuffer();

    for (final line in lines) {
      if (line.startsWith('## ')) {
        // Save previous section
        if (currentSection != null) {
          sections.add(_Section(
            title: currentSection,
            content: currentContent.toString().trim(),
          ));
          currentContent.clear();
        }
        currentSection = line.substring(3).trim();
      } else if (line.startsWith('# ')) {
        // Main title (skip)
        continue;
      } else if (currentSection != null) {
        currentContent.writeln(line);
      }
    }

    // Add last section
    if (currentSection != null) {
      sections.add(_Section(
        title: currentSection,
        content: currentContent.toString().trim(),
      ));
    }

    return sections;
  }

  @override
  Widget build(BuildContext context) {
    final sections = _parseSections(content);

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: sections.length + 1, // +1 for header
      itemBuilder: (context, index) {
        if (index == 0) {
          // Header card
          return _buildHeaderCard();
        }

        final section = sections[index - 1];
        return _buildSectionCard(section, index - 1);
      },
    );
  }

  Widget _buildHeaderCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF2563EB),
            const Color(0xFF1E40AF),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2563EB).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.shield_outlined,
                  color: Colors.white,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Legal Document',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Last Updated: January 2025',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
              ),
            ),
            child: const Row(
              children: [
                Icon(
                  Icons.info_outline,
                  color: Colors.white,
                  size: 16,
                ),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Please read carefully and understand all terms',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard(_Section section, int index) {
    final sectionColor = _getSectionColor(section.title);
    final icon = _getSectionIcon(section.title);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: sectionColor.withOpacity(0.3),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withOpacity(0.3)
                : Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: sectionColor.withOpacity(0.1),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(10),
                topRight: Radius.circular(10),
              ),
              border: Border(
                bottom: BorderSide(
                  color: sectionColor.withOpacity(0.3),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: sectionColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    icon,
                    color: sectionColor,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    section.title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                      letterSpacing: -0.3,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: sectionColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${index + 1}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: sectionColor,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Section Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: _buildFormattedContent(section.content),
          ),
        ],
      ),
    );
  }

  Widget _buildFormattedContent(String content) {
    final lines = content.split('\n');
    final widgets = <Widget>[];

    for (final line in lines) {
      if (line.trim().isEmpty) {
        widgets.add(const SizedBox(height: 8));
        continue;
      }

      if (line.startsWith('### ')) {
        // Sub-heading
        widgets.add(Padding(
          padding: const EdgeInsets.only(top: 12, bottom: 8),
          child: Text(
            line.substring(4),
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
        ));
      } else if (line.startsWith('**') && line.endsWith('**')) {
        // Bold text
        widgets.add(Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text(
            line.replaceAll('**', ''),
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
        ));
      } else if (line.startsWith('- ')) {
        // List item
        widgets.add(Padding(
          padding: const EdgeInsets.only(left: 16, bottom: 6),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 8),
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  line.substring(2),
                  style: TextStyle(
                    fontSize: 14,
                    height: 1.6,
                    color: isDark ? Colors.grey[300] : Colors.black87,
                  ),
                ),
              ),
            ],
          ),
        ));
      } else {
        // Regular paragraph
        widgets.add(Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Text(
            line,
            style: TextStyle(
              fontSize: 14,
              height: 1.6,
              color: isDark ? Colors.grey[300] : Colors.black87,
            ),
          ),
        ));
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: widgets,
    );
  }

  Color _getSectionColor(String title) {
    final lowerTitle = title.toLowerCase();
    if (lowerTitle.contains('disclaimer') || lowerTitle.contains('important') || lowerTitle.contains('not a substitute')) {
      return Colors.red;
    } else if (lowerTitle.contains('rights') || lowerTitle.contains('responsibilities')) {
      return Colors.orange;
    } else if (lowerTitle.contains('contact') || lowerTitle.contains('support')) {
      return Colors.green;
    } else if (lowerTitle.contains('data') || lowerTitle.contains('privacy') || lowerTitle.contains('security')) {
      return Colors.blue;
    } else if (lowerTitle.contains('agreement') || lowerTitle.contains('terms')) {
      return Colors.purple;
    }
    return const Color(0xFF2563EB);
  }

  IconData _getSectionIcon(String title) {
    final lowerTitle = title.toLowerCase();
    if (lowerTitle.contains('disclaimer') || lowerTitle.contains('important')) {
      return Icons.warning_amber_rounded;
    } else if (lowerTitle.contains('rights')) {
      return Icons.verified_user_outlined;
    } else if (lowerTitle.contains('contact')) {
      return Icons.email_outlined;
    } else if (lowerTitle.contains('data') || lowerTitle.contains('privacy')) {
      return Icons.security_outlined;
    } else if (lowerTitle.contains('agreement') || lowerTitle.contains('terms')) {
      return Icons.description_outlined;
    } else if (lowerTitle.contains('responsibilities')) {
      return Icons.assignment_outlined;
    } else if (lowerTitle.contains('limitation')) {
      return Icons.block_outlined;
    }
    return Icons.article_outlined;
  }
}

class _Section {
  final String title;
  final String content;

  _Section({
    required this.title,
    required this.content,
  });
}
