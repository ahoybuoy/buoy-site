export function GET() {
  return new Response(JSON.stringify({
    componentCount: 98,
    tokenCount: 40,
    hardcodedValueCount: 0,
    unusedTokenCount: 4,
    namingInconsistencyCount: 0,
    criticalCount: 0,
    accessibilityConflictCount: 0,
    colorContrastCount: 0,
    hasUtilityFramework: true,
    hasDesignSystemLibrary: false,
    totalDriftCount: 4,
    unusedComponentCount: 0,
    repeatedPatternCount: 0,
    orphanedComponentCount: 0,
    semanticMismatchCount: 0,
    deprecatedPatternCount: 0,
    orphanedTokenCount: 0,
    valueDivergenceCount: 0,
    missingDocumentationCount: 0,
    frameworkSprawlCount: 0,
    highDensityFileCount: 0,
    vendoredDriftCount: 0,
    detectedFrameworkNames: ["react", "astro", "tailwind"]
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
