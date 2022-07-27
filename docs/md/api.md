## Functions

<dl>
<dt><a href="#addFrame">addFrame(files, printPaperOptions, frameOptions, output, frameWidthFactor)</a> ⇒ <code>Promise.&lt;boolean&gt;</code></dt>
<dd><p>This function adds a frame around the image to change the aspect ratio. </br>
This is helpful when the image you are trying to print has different aspect ratio than the printer paper</p>
</dd>
<dt><a href="#resize">resize(files, width, grayscale, output)</a> ⇒ <code>Promise.&lt;boolean&gt;</code></dt>
<dd><p>Resizes given file(s) preserving the aspect ratio</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#PrintPaperOptionsType">PrintPaperOptionsType</a> : <code>Object</code></dt>
<dd><p>Information about the printing paper</p>
</dd>
<dt><a href="#FrameOptionsType">FrameOptionsType</a> : <code>Object</code></dt>
<dd><p>Information about the frame</p>
</dd>
</dl>

<a name="addFrame"></a>

## addFrame(files, printPaperOptions, frameOptions, output, frameWidthFactor) ⇒ <code>Promise.&lt;boolean&gt;</code>
This function adds a frame around the image to change the aspect ratio. </br>
This is helpful when the image you are trying to print has different aspect ratio than the printer paper

**Kind**: global function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - True if successful  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| files | <code>Array.&lt;string&gt;</code> \| <code>Buffer</code> |  | glob, file names or Buffer |
| printPaperOptions | [<code>PrintPaperOptionsType</code>](#PrintPaperOptionsType) |  | information about the printing paper |
| frameOptions | [<code>FrameOptionsType</code>](#FrameOptionsType) |  | information about the frame color and image position with the frame (image position is currently not used) |
| output | <code>string</code> | <code>&quot;.&quot;</code> | output folder |
| frameWidthFactor | <code>number</code> | <code>0.05</code> | width of the frame (smallest dimension x frameWidthFactor) |

<a name="resize"></a>

## resize(files, width, grayscale, output) ⇒ <code>Promise.&lt;boolean&gt;</code>
Resizes given file(s) preserving the aspect ratio

**Kind**: global function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true if successful  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| files | <code>string</code> |  | file or glob |
| width | <code>number</code> |  | desired output file width |
| grayscale | <code>boolean</code> | <code>false</code> | if true img will be grayscaled |
| output | <code>string</code> | <code>&quot;.&quot;</code> | output folder |

<a name="PrintPaperOptionsType"></a>

## PrintPaperOptionsType : <code>Object</code>
Information about the printing paper

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| printPaperWidth | <code>number</code> | Width of the printing paper |
| printPaperHeigh | <code>number</code> | Height of the printing paper |

<a name="FrameOptionsType"></a>

## FrameOptionsType : <code>Object</code>
Information about the frame

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| frameColor | <code>string</code> | Width of the printing paper |
| imagePosition | <code>object</code> | Position of the image |

