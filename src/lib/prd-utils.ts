import { GeneratePrdFromConceptOutput } from "@/ai/flows/generate-prd-from-concept";

export function formatPrdToMarkdown(data: GeneratePrdFromConceptOutput): string {
  return `# Product Requirements Document

## 1. Overview
${data.overview}

## 2. Tech Stack
${data.techStack}

## 3. Features
${data.features}

## 4. Data Model
${data.dataModel}

## 5. Phases
${data.phases}
`;
}

export function parseMarkdownToSections(markdown: string): Partial<GeneratePrdFromConceptOutput> {
  const sections: Partial<GeneratePrdFromConceptOutput> = {};
  
  const overviewMatch = markdown.match(/## 1\. Overview\n([\s\S]*?)(?=\n## 2\.|$)/);
  const techStackMatch = markdown.match(/## 2\. Tech Stack\n([\s\S]*?)(?=\n## 3\.|$)/);
  const featuresMatch = markdown.match(/## 3\. Features\n([\s\S]*?)(?=\n## 4\.|$)/);
  const dataModelMatch = markdown.match(/## 4\. Data Model\n([\s\S]*?)(?=\n## 5\.|$)/);
  const phasesMatch = markdown.match(/## 5\. Phases\n([\s\S]*?)(?=$)/);

  if (overviewMatch) sections.overview = overviewMatch[1].trim();
  if (techStackMatch) sections.techStack = techStackMatch[1].trim();
  if (featuresMatch) sections.features = featuresMatch[1].trim();
  if (dataModelMatch) sections.dataModel = dataModelMatch[1].trim();
  if (phasesMatch) sections.phases = phasesMatch[1].trim();

  return sections;
}

export function downloadMarkdown(content: string, filename: string = "prd.md") {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
