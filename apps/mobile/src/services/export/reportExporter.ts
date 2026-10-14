import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { AnalysisResult } from '../../domain/types';

export class ReportExporter {
  /**
   * Generates a structured Markdown report from an analysis result
   */
  public static generateMarkdownReport(result: AnalysisResult): string {
    const timestamp = new Date(result.createdAt).toLocaleString();
    const topCandidate = result.candidates[0];

    let md = `# Bug Root Cause Analysis Report\n\n`;
    md += `**Date:** ${timestamp}\n`;
    md += `**Category:** ${result.category}\n`;
    md += `**Language:** ${result.language.toUpperCase()}\n`;
    md += `**Engine Version:** ${result.engineVersion}\n\n`;

    md += `## Summary\n${result.summary}\n\n`;

    if (result.parsedInfo.rootFile) {
      md += `## Origin Location\n`;
      md += `- **File:** \`${result.parsedInfo.rootFile}\`\n`;
      if (result.parsedInfo.rootLine) {
        md += `- **Line:** ${result.parsedInfo.rootLine}\n`;
      }
      if (result.parsedInfo.exceptionType) {
        md += `- **Exception:** \`${result.parsedInfo.exceptionType}\`\n`;
      }
      md += `\n`;
    }

    md += `## Likely Root Causes (Ranked)\n\n`;
    result.candidates.forEach((c, idx) => {
      md += `### #${idx + 1}: ${c.title}\n`;
      if (c.scoreLabel) {
        md += `*Match Level: ${c.scoreLabel} (${Math.round((c.score || 0) * 100)}%)*\n\n`;
      }
      md += `${c.explanation}\n\n`;

      if (c.suggestedChecks.length > 0) {
        md += `#### Troubleshooting Steps:\n`;
        c.suggestedChecks.forEach((check) => {
          md += `- **${check.title}** (${check.risk} risk)\n`;
          check.instructions.forEach((inst) => {
            md += `  - ${inst}\n`;
          });
        });
        md += `\n`;
      }

      if (c.suggestedRemedies && c.suggestedRemedies.length > 0) {
        md += `#### Suggested Fixes:\n`;
        c.suggestedRemedies.forEach((rem) => {
          md += `- **${rem.title}**: ${rem.description}\n`;
          if (rem.codeSnippet) {
            md += `\`\`\`${result.language}\n${rem.codeSnippet}\n\`\`\`\n`;
          }
        });
        md += `\n`;
      }
    });

    md += `## Original Error Excerpt\n`;
    md += `\`\`\`\n${result.originalInput.slice(0, 500)}${
      result.originalInput.length > 500 ? '\n...[truncated]' : ''
    }\n\`\`\`\n\n`;

    md += `## Limitations & Offline Notice\n`;
    result.limitations.forEach((lim) => {
      md += `- ${lim}\n`;
    });

    return md;
  }

  /**
   * Copy the markdown report to clipboard
   */
  public static async copyToClipboard(result: AnalysisResult): Promise<boolean> {
    const report = this.generateMarkdownReport(result);
    await Clipboard.setStringAsync(report);
    return true;
  }

  /**
   * Share report using system native share sheet
   */
  public static async shareReport(result: AnalysisResult): Promise<void> {
    const report = this.generateMarkdownReport(result);
    await Share.share({
      title: `Root Cause Analysis: ${result.category}`,
      message: report,
    });
  }
}
