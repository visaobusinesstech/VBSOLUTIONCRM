
import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { wrapHtmlWithFontSize } from '@/utils/fontSizeProcessor';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUrlChange?: (imageUrl: string | null) => void;
  placeholder?: string;
  fontSize?: string;
}

export interface RichTextEditorRef {
  insertVariable: (variable: string) => void;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, onImageUrlChange, placeholder = "Digite aqui...", fontSize = "16px" }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        TextStyle,
        FontFamily,
        Underline,
        Link.configure({
          openOnClick: false,
        }),
        Image,
        Placeholder.configure({
          placeholder,
        }),
      ],
      content: value,
      onUpdate: ({ editor }) => {
        const content = editor.getHTML();
        console.log('🎨 RichTextEditor: Conteúdo atualizado, aplicando font-size:', fontSize);
        
        // Envolver o conteúdo com font-size antes de enviar para o parent
        const contentWithFontSize = wrapHtmlWithFontSize(content, fontSize);
        onChange(contentWithFontSize);
        
        // Extract image URL from content
        if (onImageUrlChange) {
          const imageUrl = extractImageUrlFromContent(content);
          onImageUrlChange(imageUrl);
        }
      },
    });

    // Expor método para inserir variáveis via ref
    useImperativeHandle(ref, () => ({
      insertVariable: (variable: string) => {
        if (editor) {
          console.log('📝 RichTextEditor: Inserindo variável:', variable);
          editor.chain().focus().insertContent(' ' + variable + ' ').run();
        }
      }
    }), [editor]);

    // Function to extract the first image URL from HTML content
    const extractImageUrlFromContent = (htmlContent: string): string | null => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const imgElement = tempDiv.querySelector('img');
      return imgElement ? imgElement.src : null;
    };

    // Apply font-size to content when editor or fontSize changes
    useEffect(() => {
      if (!editor || !fontSize) return;

      console.log('🎨 RichTextEditor: Aplicando font-size ao editor:', fontSize);

      // Apply font-size visual no container para preview
      const editorElement = editor.view.dom as HTMLElement;
      editorElement.style.fontSize = fontSize;
      editorElement.style.lineHeight = '1.6';

      // Aplicar font-size a todo o conteúdo usando comandos do editor
      const { from, to } = editor.state.doc.content.size > 0 ? 
        { from: 0, to: editor.state.doc.content.size } : 
        { from: 0, to: 0 };
      
      if (from < to) {
        // Aplicar estilo de texto para preservar o font-size no HTML
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .setMark('textStyle', { fontSize })
          .run();
      }

      // Configurar estilo padrão para novo texto
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          setTimeout(() => {
            if (editor && fontSize) {
              editor.chain().focus().setMark('textStyle', { fontSize }).run();
            }
          }, 10);
        }
      };

      editorElement.addEventListener('keydown', handleKeyDown);
      return () => {
        if (editorElement) {
          editorElement.removeEventListener('keydown', handleKeyDown);
        }
      };
    }, [editor, fontSize]);

    // Update content when value prop changes
    useEffect(() => {
      if (!editor) return;
      
      // Remove wrapper div se existir para evitar duplicação
      let cleanContent = value;
      if (value.includes('<div style="font-size:')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;
        const wrapperDiv = tempDiv.querySelector('div[style*="font-size"]');
        if (wrapperDiv) {
          cleanContent = wrapperDiv.innerHTML;
        }
      }
      
      if (cleanContent !== editor.getHTML()) {
        console.log('🎨 RichTextEditor: Atualizando conteúdo do editor');
        editor.commands.setContent(cleanContent);
        
        // Reapply font-size after setting content
        if (fontSize) {
          setTimeout(() => {
            const { from, to } = editor.state.doc.content.size > 0 ? 
              { from: 0, to: editor.state.doc.content.size } : 
              { from: 0, to: 0 };
            
            if (from < to) {
              editor.chain()
                .focus()
                .setTextSelection({ from, to })
                .setMark('textStyle', { fontSize })
                .run();
            }
          }, 100);
        }
      }
    }, [value, editor, fontSize]);

    if (!editor) {
      return null;
    }

    const addLink = () => {
      const url = window.prompt('Digite a URL:');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    };

    const addImage = () => {
      const url = window.prompt('Digite a URL da imagem:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
        
        // Immediately notify parent about the new image URL
        if (onImageUrlChange) {
          onImageUrlChange(url);
        }
      }
    };

    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="border-b bg-muted/50 p-2">
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              type="button"
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant={editor.isActive('underline') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              type="button"
              variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              type="button"
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addLink}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addImage}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="min-h-[200px] p-4">
          <EditorContent 
            editor={editor} 
            className="prose prose-sm max-w-none focus:outline-none"
            style={{ fontSize, lineHeight: '1.6' }}
          />
          {/* Font size indicator */}
          <div className="text-xs text-muted-foreground mt-2 opacity-60">
            Tamanho da fonte: {fontSize}
          </div>
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
