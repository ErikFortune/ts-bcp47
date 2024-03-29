<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@fgv/ts-bcp47](./ts-bcp47.md) &gt; [Bcp47](./ts-bcp47.bcp47.md)

## Bcp47 namespace

## Classes

|  Class | Description |
|  --- | --- |
|  [LanguageTag](./ts-bcp47.bcp47.languagetag.md) | Represents a single BCP-47 language tag. |
|  [NormalizeTag](./ts-bcp47.bcp47.normalizetag.md) | Normalization helpers for BCP-47 language tags. |
|  [ValidateTag](./ts-bcp47.bcp47.validatetag.md) | Validation helpers for BCP-47 language tags. |

## Functions

|  Function | Description |
|  --- | --- |
|  [choose(desired, available, options)](./ts-bcp47.bcp47.choose.md) | Matches a list of desired [languages](./ts-bcp47.bcp47.languagespec.md) to a list of available [languages](./ts-bcp47.bcp47.languagespec.md)<!-- -->, return a list of matching languages ordered from best to worst. |
|  [similarity(t1, t2, options)](./ts-bcp47.bcp47.similarity.md) | Determine how similar two language tags are to each other. |
|  [tag(from, options)](./ts-bcp47.bcp47.tag.md) | <p>Creates a new [language tag](./ts-bcp47.bcp47.languagetag.md) from a [language specifier](./ts-bcp47.bcp47.languagespec.md)</p><p>The supplied initializer must be at least [well-formed according to RFC 5646](https://www.rfc-editor.org/rfc/rfc5646.html#section-2.2.9)<!-- -->. Higher degrees of validation along with any normalizations may be optionally specified.</p> |
|  [tags(from, options)](./ts-bcp47.bcp47.tags.md) | Creates an array of [language tags](./ts-bcp47.bcp47.languagetag.md) from an incoming array of [language specifiers](./ts-bcp47.bcp47.languagespec.md)<!-- -->. |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [ExtensionSubtagValue](./ts-bcp47.bcp47.extensionsubtagvalue.md) |  |
|  [LanguageFilterOptions](./ts-bcp47.bcp47.languagefilteroptions.md) | Options for [language tag list filter](./ts-bcp47.bcp47.choose.md) functions. |
|  [LanguageTagInitOptions](./ts-bcp47.bcp47.languagetaginitoptions.md) | Initialization options for parsing or creation of [language tag](./ts-bcp47.bcp47.languagetag.md) objects. |
|  [Subtags](./ts-bcp47.bcp47.subtags.md) |  |

## Variables

|  Variable | Description |
|  --- | --- |
|  [tagSimilarity](./ts-bcp47.bcp47.tagsimilarity.md) | Common levels of match quality for a single language match. |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [ExtensionSingleton](./ts-bcp47.bcp47.extensionsingleton.md) |  |
|  [ExtensionSubtag](./ts-bcp47.bcp47.extensionsubtag.md) |  |
|  [LanguageSpec](./ts-bcp47.bcp47.languagespec.md) | Any of the possible ways to represent a language - as a <code>string</code>, parsed [subtags](./ts-bcp47.bcp47.subtags.md) or an instantiated [language tag](./ts-bcp47.bcp47.languagetag.md)<!-- -->. |
|  [TagNormalization](./ts-bcp47.bcp47.tagnormalization.md) | Describes the degree of normalization of a language tag. |
|  [TagSimilarity](./ts-bcp47.bcp47.tagsimilarity.md) | Numeric representation of the quality of a language match. Range is 0 (no match) to 1 (exact match). |
|  [TagValidity](./ts-bcp47.bcp47.tagvalidity.md) | Describes the validation level of a particular tag. |

