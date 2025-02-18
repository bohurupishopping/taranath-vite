import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import '../../models/taranath_model.dart';

@immutable
class PredictionSection {
  final String englishTitle;
  final String displayTitle;
  final String content;
  final IconData icon;

  const PredictionSection({
    required this.englishTitle,
    required this.displayTitle,
    required this.content,
    required this.icon,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PredictionSection &&
          runtimeType == other.runtimeType &&
          englishTitle == other.englishTitle &&
          displayTitle == other.displayTitle &&
          content == other.content &&
          icon == other.icon;

  @override
  int get hashCode => Object.hash(englishTitle, displayTitle, content, icon);
}

@immutable
class _PredictionCardStyles {
  static const titleStyle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Color(0xFF312E81),
    letterSpacing: 0.3,
  );

  static const sectionTitleStyle = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    color: Color(0xFF6B46C1),
    letterSpacing: 0.2,
  );

  static const contentStyle = TextStyle(
    fontSize: 14,
    height: 1.5,
    color: Color(0xFF1F2937),
    letterSpacing: 0.2,
  );

  static const infoTextStyle = TextStyle(
    fontSize: 14,
    color: Color(0xFF1F2937),
    letterSpacing: 0.2,
  );

  static const actionButtonTextStyle = TextStyle(
    fontSize: 13,
    color: Color(0xFF6B46C1),
    fontWeight: FontWeight.w600,
    letterSpacing: 0.2,
  );

  static final cardDecoration = BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(16),
    boxShadow: [
      BoxShadow(
        color: const Color(0xFF6B46C1).withOpacity(0.08),
        offset: const Offset(0, 4),
        blurRadius: 16,
      ),
    ],
  );

  static const headerGradient = LinearGradient(
    colors: [
      Color(0xFF6B46C1),
      Color(0xFF4F46E5),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    stops: [0.0, 1.0],
    transform: GradientRotation(45 * 3.1415927 / 180),
  );

  static const footerGradient = LinearGradient(
    colors: [
      Color(0xFF6B46C1),
      Color(0xFF4F46E5),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    stops: [0.0, 1.0],
    transform: GradientRotation(45 * 3.1415927 / 180),
  );

  static final markdownStyleSheet = MarkdownStyleSheet(
    p: contentStyle,
    strong: const TextStyle(
      fontWeight: FontWeight.w600,
      color: Color(0xFF6B46C1),
    ),
    em: const TextStyle(
      fontStyle: FontStyle.italic,
      color: Color(0xFF6B46C1),
    ),
    listBullet: contentStyle,
  );

  static const double iconSize = 16;
  static const double spacing = 8;
  static const double padding = 12;
  static const double borderRadius = 16;

  static const _sectionIcons = <String, IconData>{
    'quick summary': Icons.summarize,
    'life line analysis': Icons.timeline,
    'heart line interpretation': Icons.favorite,
    'head line insights': Icons.psychology,
    'fate line reading': Icons.route,
    'financial indications': Icons.attach_money,
    'travel & foreign influences': Icons.flight,
    'fame & recognition': Icons.star,
    'mount analysis': Icons.landscape,
    'special signs & warnings': Icons.warning,
    'future timeline': Icons.update,
    'behavioral patterns': Icons.person,
    'practical guidance': Icons.lightbulb,
    'astrological correlations': Icons.auto_awesome,
  };

  const _PredictionCardStyles._();
}

class PredictionCard extends StatelessWidget {
  final String prediction;
  final String clientName;
  final DateTime? birthDate;
  final String? birthPlace;
  final String? rashi;
  final TaranathModel model;
  final bool isPalmistryMode;
  final VoidCallback onShare;
  final VoidCallback onSaveImage;
  final VoidCallback onDownloadPdf;

  // Initialize sections in the constructor
  final List<PredictionSection> _sections;

  PredictionCard({
    super.key,
    required this.prediction,
    required this.clientName,
    this.birthDate,
    this.birthPlace,
    this.rashi,
    required this.model,
    required this.isPalmistryMode,
    required this.onShare,
    required this.onSaveImage,
    required this.onDownloadPdf,
  }) : _sections = _initializeSections(prediction);

  // Static method to initialize sections
  static List<PredictionSection> _initializeSections(String prediction) {
    if (prediction.isEmpty) {
      return const [
        PredictionSection(
          englishTitle: 'Quick Summary',
          displayTitle: 'Quick Summary',
          content: 'No summary available',
          icon: Icons.summarize,
        ),
      ];
    }

    final sections = <PredictionSection>[];
    final lines = prediction.split('\n');
    String currentTitle = '';
    String currentEnglishTitle = '';
    String currentContent = '';

    for (var line in lines) {
      if (line.startsWith('## ')) {
        if (currentTitle.isNotEmpty && currentContent.isNotEmpty) {
          sections.add(_createSectionStatic(currentEnglishTitle, currentTitle, currentContent.trim()));
          currentContent = '';
        }
        final titleParts = line.substring(3).split('|');
        currentEnglishTitle = titleParts[0].trim().toLowerCase();
        currentTitle = titleParts.length > 1 ? titleParts[1].trim() : titleParts[0].trim();
      } else if (currentTitle.isNotEmpty) {
        currentContent += '$line\n';
      }
    }

    if (currentTitle.isNotEmpty && currentContent.isNotEmpty) {
      sections.add(_createSectionStatic(currentEnglishTitle, currentTitle, currentContent.trim()));
    }

    return sections;
  }

  // Static method to create a section
  static PredictionSection _createSectionStatic(String englishTitle, String displayTitle, String content) {
    final IconData icon = _PredictionCardStyles._sectionIcons[englishTitle] ?? Icons.article;
    return PredictionSection(
      englishTitle: englishTitle,
      displayTitle: displayTitle,
      content: content,
      icon: icon,
    );
  }

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: _PredictionCardStyles.cardDecoration,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const _Header(),
            _ClientInfo(
              clientName: clientName,
              birthDate: birthDate,
              birthPlace: birthPlace,
              rashi: rashi,
            ),
            if (_sections.isNotEmpty)
              _QuickSummary(section: _sections.first),
            if (_sections.length > 1)
              _SectionsList(sections: _sections.skip(1).toList()),
            _Footer(
              onShare: onShare,
              onSaveImage: onSaveImage,
              onDownloadPdf: onDownloadPdf,
              clientName: clientName,
              birthDate: birthDate,
              birthPlace: birthPlace,
              rashi: rashi,
              model: model,
              isPalmistryMode: isPalmistryMode,
            ),
          ],
        ),
      ),
    );
  }
}

@immutable
class _Header extends StatelessWidget {
  const _Header();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(_PredictionCardStyles.padding),
      decoration: BoxDecoration(
        gradient: _PredictionCardStyles.headerGradient.scale(0.1),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(_PredictionCardStyles.borderRadius),
          topRight: Radius.circular(_PredictionCardStyles.borderRadius),
        ),
      ),
      child: const Row(
        children: [
          _HeaderIcon(),
          SizedBox(width: _PredictionCardStyles.spacing),
          Text(
            'Palm Reading',
            style: _PredictionCardStyles.titleStyle,
          ),
        ],
      ),
    );
  }
}

@immutable
class _HeaderIcon extends StatelessWidget {
  const _HeaderIcon();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFF6B46C1).withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: const Icon(
        Icons.back_hand,
        color: Color(0xFF6B46C1),
        size: 18,
      ),
    );
  }
}

@immutable
class _ClientInfo extends StatelessWidget {
  final String clientName;
  final DateTime? birthDate;
  final String? birthPlace;
  final String? rashi;

  const _ClientInfo({
    required this.clientName,
    this.birthDate,
    this.birthPlace,
    this.rashi,
  });

  @override
  Widget build(BuildContext context) {
    final hasAdditionalInfo = birthDate != null || birthPlace != null || rashi != null;

    return Padding(
      padding: const EdgeInsets.all(_PredictionCardStyles.padding),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Text(
            clientName,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1F2937),
              letterSpacing: 0.2,
            ),
          ),
          if (hasAdditionalInfo) ...[
            const SizedBox(width: _PredictionCardStyles.spacing),
            Expanded(
              child: Wrap(
                spacing: 6,
                runSpacing: 6,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  if (birthDate != null)
                    _InfoTag(
                      icon: Icons.calendar_today,
                      text: birthDate!.toLocal().toString().split(' ')[0],
                    ),
                  if (birthPlace != null)
                    _InfoTag(
                      icon: Icons.location_on,
                      text: birthPlace!,
                    ),
                  if (rashi != null)
                    _InfoTag(
                      icon: Icons.auto_awesome,
                      text: rashi!,
                    ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

@immutable
class _QuickSummary extends StatelessWidget {
  final PredictionSection section;

  const _QuickSummary({required this.section});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: _PredictionCardStyles.padding),
      child: Container(
        padding: const EdgeInsets.all(_PredictionCardStyles.padding),
        decoration: BoxDecoration(
          gradient: _PredictionCardStyles.footerGradient.scale(0.05),
          borderRadius: BorderRadius.circular(_PredictionCardStyles.borderRadius - 4),
          border: Border.all(
            color: const Color(0xFF6B46C1).withOpacity(0.1),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _SectionHeader(
              icon: section.icon,
              title: section.displayTitle,
            ),
            const SizedBox(height: _PredictionCardStyles.spacing),
            MarkdownBody(
              data: section.content,
              styleSheet: _PredictionCardStyles.markdownStyleSheet,
              shrinkWrap: true,
            ),
          ],
        ),
      ),
    );
  }
}

@immutable
class _SectionsList extends StatelessWidget {
  final List<PredictionSection> sections;

  const _SectionsList({required this.sections});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(_PredictionCardStyles.padding),
      itemCount: sections.length,
      itemBuilder: (context, index) {
        final section = sections[index];
        return _CollapsibleSection(
          key: ValueKey(section.englishTitle),
          section: section,
        );
      },
    );
  }
}

@immutable
class _Footer extends StatelessWidget {
  final VoidCallback onShare;
  final VoidCallback onSaveImage;
  final VoidCallback onDownloadPdf;
  final String clientName;
  final DateTime? birthDate;
  final String? birthPlace;
  final String? rashi;
  final TaranathModel model;
  final bool isPalmistryMode;

  const _Footer({
    required this.onShare,
    required this.onSaveImage,
    required this.onDownloadPdf,
    required this.clientName,
    this.birthDate,
    this.birthPlace,
    this.rashi,
    required this.model,
    required this.isPalmistryMode,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(_PredictionCardStyles.padding),
      decoration: BoxDecoration(
        gradient: _PredictionCardStyles.footerGradient.scale(0.05),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(_PredictionCardStyles.borderRadius),
          bottomRight: Radius.circular(_PredictionCardStyles.borderRadius),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _ActionButton(
            icon: Icons.share,
            label: 'Share',
            onPressed: () async {
              // Get all sections from the parent PredictionCard
              final sections = context.findAncestorWidgetOfExactType<PredictionCard>()?._sections ?? [];
              
              // Build the complete share text
              final StringBuffer shareText = StringBuffer();
              
              // Add header
              shareText.writeln('*Palm Reading for $clientName*');
              if (birthDate != null) shareText.writeln('Born: ${birthDate!.toLocal().toString().split(' ')[0]}');
              if (birthPlace != null) shareText.writeln('Place: $birthPlace');
              if (rashi != null) shareText.writeln('Rashi: $rashi');
              shareText.writeln();

              // Add all sections
              for (final section in sections) {
                shareText.writeln('## ${section.displayTitle}');
                shareText.writeln(section.content);
                shareText.writeln();
              }

              // Add footer
              shareText.writeln('_Generated using ${model.name}_');

              try {
                final tempDir = await getTemporaryDirectory();
                final file = File('${tempDir.path}/taranath_reading.txt');
                await file.writeAsString(shareText.toString());
                
                await Share.shareXFiles(
                  [XFile(file.path)],
                  text: 'Taranath Reading',
                );
              } catch (e) {
                debugPrint('Error sharing: $e');
                await Share.share(shareText.toString());
              }
              
              onShare();
            },
          ),
        ],
      ),
    );
  }
}

@immutable
class _InfoTag extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoTag({
    required this.icon,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF6B46C1).withOpacity(0.05),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: _PredictionCardStyles.iconSize - 4,
            color: const Color(0xFF6B46C1),
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: _PredictionCardStyles.infoTextStyle,
          ),
        ],
      ),
    );
  }
}

@immutable
class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final String title;

  const _SectionHeader({
    required this.icon,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: const Color(0xFF6B46C1).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            color: const Color(0xFF6B46C1),
            size: _PredictionCardStyles.iconSize,
          ),
        ),
        const SizedBox(width: _PredictionCardStyles.spacing),
        Text(
          title,
          style: _PredictionCardStyles.sectionTitleStyle,
        ),
      ],
    );
  }
}

@immutable
class _CollapsibleSection extends StatelessWidget {
  final PredictionSection section;

  const _CollapsibleSection({
    super.key,
    required this.section,
  });

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(_PredictionCardStyles.borderRadius - 4),
          border: Border.all(
            color: const Color(0xFF6B46C1).withOpacity(0.1),
          ),
        ),
        child: Theme(
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            leading: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF6B46C1).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                section.icon,
                color: const Color(0xFF6B46C1),
                size: _PredictionCardStyles.iconSize,
              ),
            ),
            title: Text(
              section.displayTitle,
              style: _PredictionCardStyles.sectionTitleStyle,
            ),
            childrenPadding: const EdgeInsets.all(_PredictionCardStyles.padding),
            children: [
              MarkdownBody(
                data: section.content,
                styleSheet: _PredictionCardStyles.markdownStyleSheet,
                shrinkWrap: true,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

@immutable
class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onPressed,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFF6B46C1).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: _PredictionCardStyles.iconSize,
                color: const Color(0xFF6B46C1),
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: _PredictionCardStyles.actionButtonTextStyle,
              ),
            ],
          ),
        ),
      ),
    );
  }
} 