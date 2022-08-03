# Img Editor
## v2.0.0 (Major/breaking changes)
- Adds ability to accept buffer for `addFrame` function
- Modifies return types of the functions, now they return [object](modules/imgEditor_types.md#processedimagesinfo)
- JS -> TS migration (not all files were migrated to ts and `allowJs` flag is still enabled)
- Updated docs. Currently `typedoc` is being used to generate documentation.
- Fixed issue with very tall and wide images throwing exceptions

## v1.1.0 (typescript support)
- adds typescript support (source files are not converted to 'ts' files yet)
- documentation fixes

## v1.0.0
### This is the first release of this tool (CLI and Module)
- resize - This function allows to resize image(s) preserving their aspect ratio and/or grayscaling
- addFrame - This function allows to change the aspect ratio of image(s) by adding frame around the image of a specific color