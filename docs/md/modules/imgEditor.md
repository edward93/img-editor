[img-editor](../README.md) / [Exports](../modules.md) / imgEditor

# Module: imgEditor

## Table of contents

### Functions

- [addFrame](imgEditor.md#addframe)
- [resize](imgEditor.md#resize)

## Functions

### addFrame

▸ **addFrame**(`input`, `printPaperOptions?`, `frameOptions?`, `output?`, `frameWidthFactor?`): `Promise`<[`ProcessedImagesInfo`](imgEditor_types.md#processedimagesinfo)\>

This function adds a frame around the image to change the aspect ratio. </br>
This is helpful when the image you are trying to print has different aspect ratio than the printer paper

**`Remarks`**

When buffer is passed as an input this function will return the final, processed image buffer instead of creating a physical file itself

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `input` | `string`[] \| `Buffer` | `undefined` | file names or a Buffer </br> When buffer is passed to this function the "output" is ignored and the final processed image buffer is returned. |
| `printPaperOptions` | [`PrintPaperOptions`](imgEditor_types.md#printpaperoptions) | `undefined` | information about the printing paper |
| `frameOptions` | [`FrameOptions`](imgEditor_types.md#frameoptions) | `undefined` | information about the frame color and image position with the frame (image position is currently not used) |
| `output` | `string` | `"."` | output folder |
| `frameWidthFactor` | `number` | `0.05` | width of the frame (smallest dimension x frameWidthFactor) |

#### Returns

`Promise`<[`ProcessedImagesInfo`](imgEditor_types.md#processedimagesinfo)\>

- Information about the operation

#### Defined in

imgEditor.ts:24

___

### resize

▸ **resize**(`files`, `width?`, `grayscale?`, `output?`): `Promise`<[`ProcessedImagesInfo`](imgEditor_types.md#processedimagesinfo)\>

Resizes given file(s) preserving the aspect ratio

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `files` | `string`[] | `undefined` | list of filenames |
| `width` | `undefined` \| `number` | `undefined` | desired output file width |
| `grayscale` | `boolean` | `false` | if true img will be grayscaled |
| `output` | `string` | `"."` | output folder |

#### Returns

`Promise`<[`ProcessedImagesInfo`](imgEditor_types.md#processedimagesinfo)\>

true if successful

#### Defined in

imgEditor.ts:71
