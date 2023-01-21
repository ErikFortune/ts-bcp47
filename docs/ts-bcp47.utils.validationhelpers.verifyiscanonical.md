<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@fgv/ts-bcp47](./ts-bcp47.md) &gt; [Utils](./ts-bcp47.utils.md) &gt; [ValidationHelpers](./ts-bcp47.utils.validationhelpers.md) &gt; [verifyIsCanonical](./ts-bcp47.utils.validationhelpers.verifyiscanonical.md)

## Utils.ValidationHelpers.verifyIsCanonical() method

Determints if a supplied `unknown` is a well-formed, canonical representation of the tag validated by these helpers.

<b>Signature:</b>

```typescript
verifyIsCanonical(from: unknown, context?: TC): Result<T>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  from | unknown | The <code>unknown</code> to be validated. |
|  context | TC | <i>(Optional)</i> Optional context used in the validation. |

<b>Returns:</b>

Result&lt;T&gt;

`Success` with the validated canonical value, or `Failure` with details if an error occurs.
