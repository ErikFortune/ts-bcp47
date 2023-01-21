<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@fgv/ts-bcp47](./ts-bcp47.md) &gt; [Utils](./ts-bcp47.utils.md) &gt; [Normalizer](./ts-bcp47.utils.normalizer.md)

## Utils.Normalizer type

A function which accepts a value of the expected type and reformats it to match the canonical presentation form.

<b>Signature:</b>

```typescript
export type Normalizer<T extends string, TC = unknown> = (val: T, context?: TC) => Result<T>;
```