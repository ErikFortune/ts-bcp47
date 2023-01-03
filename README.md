<div align="center">
  <h1>ts-utils</h1>
  Typescript Utilities for BCP-47 Language Tags
</div>

<hr/>

## Summary

Typescript utilities for parsing, manipulating and comparing BCP-47 language tags.

## Installation

with npm:
```sh
npm install @fgv/ts-bcp47
```

## API Documentation
Extracted API documentation is [here](./docs/ts-bcp47.md)

## Overview

Classes and functions to:
- parse and validate BCP-47 ([RFC 5646](https://www.rfc-editor.org/rfc/rfc5646)) language tags
- normalize BCP-47 language tags into [canonical](#canonical-form) or [preferred form](#preferred-form).
- compare BCP-47 language tags

### TL; DR
For those who already understand BCP-47 language tags and just want to get started, here are a few examples:
```ts
import { Bcp} from '@fgv/ts-bcp47';

# parse a tag to extract primary language and region
const {primaryLanguage, region} = Bcp.tag('en-us').orThrow().subtags;
# primaryLanguage is 'en', region is 'us'

# parse a tag to extract primary language and region in canonical form
const {primaryLanguage, region} = Bcp.tag('en-us', { normalization: 'canonical' }).orThrow().subtags;
# primary language is 'en', region is 'US'

```

*Note:* This library uses the `Result` pattern, so the return value from any method that might fail is a `Result` object that must be tested for success or failure.  These examples use either [orThrow](https://github.com/DidjaRedo/ts-utils/blob/master/docs/ts-utils.iresult.orthrow.md) or [orDefault](https://github.com/DidjaRedo/ts-utils/blob/master/docs/ts-utils.iresult.ordefault.md) to convert an error result to either an exception or undefined.

### Anatomy of a BCP-47 language tag.
As specified in [RFC 5646](https://www.rfc-editor.org/rfc/rfc5646), a language tag consists of a series of `subtags` (mostly optional), each of which describes some aspect of the language being referenced.

#### Subtags
The full set of subtags that make up a language tag are:
- [primary language](https://www.rfc-editor.org/rfc/rfc5646#section-2.2.1)
- [extlang](https://www.rfc-editor.org/rfc/rfc5646#section-2.2.2)
- [script](https://www.rfc-editor.org/rfc/rfc5646#section-2.2.3)
- [region](https://www.rfc-editor.org/rfc/rfc5646#section-2.2.4)
- [variants](https://www.rfc-editor.org/rfc/rfc5646#section-2.2.4)
- [extensions](https://www.rfc-editor.org/rfc/rfc5646#section-2.2.6)
- [private-use](https://www.rfc-editor.org/rfc/rfc5646#section-2.2.7)

#### Grandfathered Tags
The RFC allows for a handful of grandfathered tags which do not meet the current specification.  Those tags are recognized in their entirety and are not composed of subtags, so for grandfathered tags only, even `primary language` is undefined.

### Conformance and Validation
The specification defines two levels of [conformance](https://www.rfc-editor.org/rfc/rfc5646#section-2.2.9) for language, and this library defines a third.

Tag validation considers the tag in its current form and never changes the tag itself.

#### Well-Formed Tags
A `well-formed` tag meets the basic syntactic requirements of the specification, but might not be valid in terms of content.

#### Valid Tags
A `valid` tag meets both the syntactic and semantic requirements of the specification, meaning that either all subtags or full tag (in the case of grandfathered tags) are registered in the [IANA language subtag registry](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry), and neither extension nor variant tags are repeated.

#### Strictly Valid Tags
A `strictly valid` tags is valid according to the specification and also meets the rules for variant and extlang prefixes defined by the specification and recorded in the language registry.

#### Examples
Some examples:
- `eng-US` is well-formed because it meets the language tag syntax but is not valid because `eng` is not a registered language subtag.
- `en-US` is both well-formed and valid, because `en` is a registered language subtag.
- `es-valencia-valencia` is well-formed but not valid, because the `valencia` extension subtag is repeated.
- `es-valencia` is well-formed and valid, but it is not strictly-valid because language subtag registry defines a `ca` prefix for the `valencia` subtag.
- `ca-valencia` is well-formed, valid, and strictly valid.

### Normalization
Normalization transforms a tag to produce a new tag which is semantically identical, but preferred for some reason.
#### Not-normalized
A non-normalized must be [`well-formed`](#well-formed-tags) and might be [`valid`](#valid-tags) or [`strictly-valid`](#strictly-valid-tags) but it does not use the letter case conventions recommended in the spec.  For example, `zh-cmn-hans-cn` is  strictly-valid but not normalized.

#### Canonical Form
A tag in canonical form meets all of the letter case conventions recommended by the specification, in addition to being at least [`well-formed`](#well-formed-tags).  For example, `zh-cmn-Hans-CN` is both strictly-valid and in canonical form.

#### Preferred Form
In addition to being [`strictly-valid`](#strictly-valid-tags) and [canonical](#canonical-form), tags
in preferred form do not have any deprecated, redundant or suppressed subtags.  For example, `zh-cmn-Hans-CN` 

#### Examples
- `zh-cmn-hans-cn` is strictly valid, but not canonical or preferred.
- `zh-cmn-Hans-CN` is strictly valid and canonical, but not preferred, because the subtag registry lists `zh-cmn-Hans` as redundant, with the preferred value `cmn-Hans`.
- `cmn-Hans-CN` is strictly valid, canonical and preferred.
- `en-latn-us` is strictly valid, but not canonical or preferred.
- `en-Latn-US` is strictly valid and canonical, but not preferred, because the subtag registry lists `Latn` as the suppressed script for the `en` language.
- `en-US` is strictly valid, canonical and preferred.
### LanguageTag class

### Subtags object

## See Also
[RFC 5646 - Tags for Identifying Languages](https://www.rfc-editor.org/rfc/rfc5646)
[IANA Language Subtag Registry](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry)