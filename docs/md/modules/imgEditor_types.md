[img-editor](../README.md) / [Exports](../modules.md) / imgEditor.types

# Module: imgEditor.types

## Table of contents

### Type Aliases

- [FrameOptions](imgEditor_types.md#frameoptions)
- [PrintPaperOptions](imgEditor_types.md#printpaperoptions)
- [ProcessedImagesInfo](imgEditor_types.md#processedimagesinfo)

## Type Aliases

### FrameOptions

Ƭ **FrameOptions**: `Object`

Information about the frame

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `frameColor` | `string` | Width of the printing paper |
| `imagePosition` | `object` | Position of the image |

#### Defined in

[imgEditor.types.ts:41](https://github.com/edward93/img-editor/blob/a3978d5/src/lib/imgEditor.types.ts#L41)

___

### PrintPaperOptions

Ƭ **PrintPaperOptions**: `Object`

Information about the printing paper

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `printPaperHeight` | `number` | Height of the printing paper |
| `printPaperWidth` | `number` | Width of the printing paper |

#### Defined in

[imgEditor.types.ts:26](https://github.com/edward93/img-editor/blob/a3978d5/src/lib/imgEditor.types.ts#L26)

___

### ProcessedImagesInfo

Ƭ **ProcessedImagesInfo**: `Object`

Information about processed images

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `any`[] | Array of buffers or filenames |
| `errors` | `string`[] | Error messages |
| `failed` | `number` | Number of failed edits |
| `successful` | `number` | Number of successfully edited images |

#### Defined in

[imgEditor.types.ts:4](https://github.com/edward93/img-editor/blob/a3978d5/src/lib/imgEditor.types.ts#L4)
