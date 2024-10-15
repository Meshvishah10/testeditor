
import { AppSettingsService } from 'src/app/services/app-settings.service';
import { Component, ElementRef, Input, Renderer2, ViewEncapsulation } from '@angular/core';
import {
	InlineEditor,
	AccessibilityHelp,
	Autoformat,
	AutoImage,
	Autosave,
	BlockQuote,
	Bold,
	CloudServices,
	Code,
	Essentials,
	Heading,
	Highlight,
	ImageBlock,
	ImageCaption,
	ImageInline,
	ImageInsertViaUrl,
	ImageResize,
	ImageStyle,
	ImageTextAlternative,
	ImageToolbar,
	ImageUpload,
	Indent,
	IndentBlock,
	Italic,
	Link,
	LinkImage,
	List,
	ListProperties,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	SelectAll,
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersMathematical,
	SpecialCharactersText,
	Subscript,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	TextTransformation,
	TodoList,
	Underline,
	Undo,
  FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	GeneralHtmlSupport,
	
	HtmlEmbed,
	type EditorConfig
} from 'ckeditor5';
declare var $: any;
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
  storageUrl:any=`https://accessmedlabuat.blob.core.windows.net/dev/client/assets/`;
  inlineElementsIds = [
    'inline-header1',
    'inline-header2',
    'inline-header3',
    'inline-header4',
    'inline-header5',
    'inline-header6',
    'inline-header7',
    'inline-header8',
    'inline-header9',
    'inline-header10',
    'inline-header11',
    'inline-header12',
    'inline-header13',
    'inline-header14',
    'inline-header15',
    'inline-header16',
    'inline-header17'
   

  ];
  editorInstances: Map<string, any> = new Map();
  constructor(
    private renderer: Renderer2,
    private el: ElementRef
  ) {
  }
  public Editor = InlineEditor;
	public config: EditorConfig = {}; 
  ngOnInit(): void {
    this.initializeEditorConfig();
  }
  initializeEditorConfig() {
    // Initialize your CKEditor instance
    this.config = {
			toolbar: {
				items: [
					'undo',
					'redo',
					'|',
					'heading',
					'|',
          'fontSize',
					'fontFamily',
					'fontColor',
					'fontBackgroundColor',
					'|',

					'bold',
					'italic',
					'underline',
					'subscript',
					'code',
					'|',
					'specialCharacters',
					'link',
          'imageUpload',
					'mediaEmbed',
					'insertTable',
					'highlight',
					'blockQuote',
					'|',
					'bulletedList',
					'numberedList',
					'todoList',
					'outdent',
					'indent'
				],
				shouldNotGroupWhenFull: false
			},
			plugins: [
				AccessibilityHelp,
				Autoformat,
				AutoImage,
				Autosave,
				BlockQuote,
				Bold,
				CloudServices,
				Code,
				Essentials,
				Heading,
				Highlight,
				ImageBlock,
				ImageCaption,
				ImageInline,
				ImageInsertViaUrl,
				ImageResize,
				ImageStyle,
				ImageTextAlternative,
				ImageToolbar,
				ImageUpload,
				Indent,
				IndentBlock,
				Italic,
				Link,
				LinkImage,
				List,
				ListProperties,
				MediaEmbed,
				Paragraph,
				PasteFromOffice,
				SelectAll,
				SpecialCharacters,
				SpecialCharactersArrows,
				SpecialCharactersCurrency,
				SpecialCharactersEssentials,
				SpecialCharactersLatin,
				SpecialCharactersMathematical,
				SpecialCharactersText,
				Subscript,
				Table,
				TableCaption,
				TableCellProperties,
				TableColumnResize,
				TableProperties,
				TableToolbar,
				TextTransformation,
				TodoList,
				Underline,
				Undo,
        FontBackgroundColor,
				FontColor,
				FontFamily,
				FontSize,
				GeneralHtmlSupport,
				HtmlEmbed,
			],
      
    
      fontFamily: {
				supportAllValues: true
			},
			fontSize: {
				options: [10, 12, 14, 'default', 18, 20, 22],
				supportAllValues: true
			},
			heading: {
				options: [
					{
						model: 'paragraph',
						title: 'Paragraph',
						class: 'ck-heading_paragraph'
					},
					{
						model: 'heading1',
						view: 'h1',
						title: 'Heading 1',
						class: 'ck-heading_heading1'
					},
					{
						model: 'heading2',
						view: 'h2',
						title: 'Heading 2',
						class: 'ck-heading_heading2'
					},
					{
						model: 'heading3',
						view: 'h3',
						title: 'Heading 3',
						class: 'ck-heading_heading3'
					},
					{
						model: 'heading4',
						view: 'h4',
						title: 'Heading 4',
						class: 'ck-heading_heading4'
					},
					{
						model: 'heading5',
						view: 'h5',
						title: 'Heading 5',
						class: 'ck-heading_heading5'
					},
					{
						model: 'heading6',
						view: 'h6',
						title: 'Heading 6',
						class: 'ck-heading_heading6'
					}
				]
			},
			image: {
				toolbar: [
					'toggleImageCaption',
					'imageTextAlternative',
					'|',
					'imageStyle:inline',
					'imageStyle:wrapText',
					'imageStyle:breakText',
					'|',
					'resizeImage'
				]
			},
		
			link: {
				addTargetToExternalLinks: true,
				defaultProtocol: 'https://',
				decorators: {
					toggleDownloadable: {
						mode: 'manual',
						label: 'Downloadable',
						attributes: {
							download: 'file'
						}
					}
				}
			},
			list: {
				properties: {
					styles: true,
					startIndex: true,
					reversed: true
				}
			},
			placeholder: 'Type or paste your content here!',
			table: {
				contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
			},
			htmlSupport: {
				allow: [
				  {
					name: /.*/, // Allow all HTML elements
					attributes: true, // Allow all attributes,
					classes:true
				  }
				]
			  }
		};
}
 
  onSubmit() {
    this.editorInstances.forEach((editor, id) => {
      const data = editor.getData(); // Get the content from the editor
      console.log(`Content of ${id}:`, data); // Output it, you can process it as needed
    });
  }
 
  ngAfterViewInit() {
    $(document).ready(() => {
      // Toggle collapse on button click
      $('.accordion-button').click((event:any) => {
        const target = $(event.currentTarget).attr('data-bs-target');
        $(event.currentTarget).toggleClass('collapsed');
        $(target).collapse('toggle');
      });
    });
    this.inlineElementsIds.forEach((id) => {
      const element = document.getElementById(id);
 
      if (!element) {
        return;
      }
      // Use InlineEditor based on id
      InlineEditor.create(
        element,
        id === 'inline-header' ? this.config : this.config
      )
        .then((editor) => {
          this.editorInstances.set(id, editor);
          (window as any).editor = editor; // Assigning to window object as in the original code
        })
        .catch((error) => {
          console.error(error.stack);
        });
    });

  }
}

