<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@fgv/ts-bcp47](./ts-bcp47.md) &gt; [Bcp47](./ts-bcp47.bcp47.md) &gt; [NormalizeTag](./ts-bcp47.bcp47.normalizetag.md)

## Bcp47.NormalizeTag class

Normalization helpers for BCP-47 language tags.

**Signature:**

```typescript
export declare class NormalizeTag 
```

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [normalizeSubtags(subtags, wantNormalization, haveNormalization)](./ts-bcp47.bcp47.normalizetag.normalizesubtags.md) | <code>static</code> | Normalizes supplied [subtags](./ts-bcp47.bcp47.subtags.md) to a requested [normalization level](./ts-bcp47.bcp47.tagnormalization.md)<!-- -->, if necessary. If no normalization is necessary, returns the supplied subtags. |
|  [toCanonical(subtags)](./ts-bcp47.bcp47.normalizetag.tocanonical.md) | <code>static</code> | Converts a BCP-47 language tag to canonical form. Canonical form uses the recommended capitalization rules specified in [RFC 5646](https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1.1) but are not otherwise modified. |
|  [toPreferred(subtags)](./ts-bcp47.bcp47.normalizetag.topreferred.md) | <code>static</code> | Converts a BCP-47 language tag to preferred form. Preferred form uses the recommended capitalization rules specified in [RFC 5646](https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1.1) and also applies additional preferred values specified in the [language subtag registry](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry)<!-- -->: extraneous (suppressed) script tags are removed, deprecated language, extlang, script or region tags are replaced with up-to-date preferred values, and grandfathered or redundant tags with a defined preferred-value are replaced in their entirety with the new preferred value. |

