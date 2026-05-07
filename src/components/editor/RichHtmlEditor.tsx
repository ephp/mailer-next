'use client';

import React, {ReactElement, useCallback, useEffect, useState} from 'react';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeMirror from '@uiw/react-codemirror';
import {html as cmHtml} from '@codemirror/lang-html';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ImageIcon from '@mui/icons-material/Image';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import {useTranslations} from 'next-intl';

type Mode = 'wysiwyg' | 'html';

interface Props {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  minHeight?: number;
}

const RichHtmlEditor = ({value, onChange, label, minHeight = 200}: Props): ReactElement => {
  const t = useTranslations();
  const [mode, setMode] = useState<Mode>('wysiwyg');
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({openOnClick: false, autolink: true}),
      Image.configure({inline: false}),
    ],
    content: value,
    onUpdate({editor}) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  const handleModeChange = useCallback((_: React.MouseEvent<HTMLElement>, next: Mode | null) => {
    if (next) setMode(next);
  }, []);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const current = editor.getAttributes('link').href as string | undefined;
    setLinkUrl(current ?? '');
    setLinkDialogOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({href: linkUrl}).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setLinkDialogOpen(false);
  }, [editor, linkUrl]);

  const applyImage = useCallback(() => {
    if (!editor || !imageUrl) {
      setImageDialogOpen(false);
      return;
    }
    editor.chain().focus().setImage({src: imageUrl, alt: imageAlt || undefined}).run();
    setImageDialogOpen(false);
    setImageUrl('');
    setImageAlt('');
  }, [editor, imageUrl, imageAlt]);

  if (!editor) {
    return <Box sx={{minHeight: `${minHeight}px`}}/>;
  }

  return (
    <Box sx={{border: '1px solid', borderColor: 'divider', borderRadius: 1}}>
      {label && (
        <Box sx={{px: 1.5, pt: 1, pb: 0.5, fontSize: '0.75rem', color: 'text.secondary'}}>{label}</Box>
      )}

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        p: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}>
        <ToggleButtonGroup size="small" value={mode} exclusive onChange={handleModeChange}>
          <ToggleButton value="wysiwyg" sx={{textTransform: 'none', px: 1.5}}>
            {t('editor.mode.wysiwyg')}
          </ToggleButton>
          <ToggleButton value="html" sx={{textTransform: 'none', px: 1.5}}>
            {t('editor.mode.html')}
          </ToggleButton>
        </ToggleButtonGroup>

        {mode === 'wysiwyg' && (
          <>
            <Divider orientation="vertical" flexItem sx={{mx: 0.5}}/>
            <Tooltip title={t('editor.btn.undo')}>
              <span>
                <IconButton size="small" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                  <UndoIcon fontSize="small"/>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('editor.btn.redo')}>
              <span>
                <IconButton size="small" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                  <RedoIcon fontSize="small"/>
                </IconButton>
              </span>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{mx: 0.5}}/>

            <Tooltip title={t('editor.btn.bold')}>
              <IconButton
                size="small"
                color={editor.isActive('bold') ? 'primary' : 'default'}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <FormatBoldIcon fontSize="small"/>
              </IconButton>
            </Tooltip>
            <Tooltip title={t('editor.btn.italic')}>
              <IconButton
                size="small"
                color={editor.isActive('italic') ? 'primary' : 'default'}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <FormatItalicIcon fontSize="small"/>
              </IconButton>
            </Tooltip>
            <Tooltip title={t('editor.btn.underline')}>
              <IconButton
                size="small"
                color={editor.isActive('underline') ? 'primary' : 'default'}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <FormatUnderlinedIcon fontSize="small"/>
              </IconButton>
            </Tooltip>
            <Tooltip title={t('editor.btn.strike')}>
              <IconButton
                size="small"
                color={editor.isActive('strike') ? 'primary' : 'default'}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <StrikethroughSIcon fontSize="small"/>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{mx: 0.5}}/>

            <Tooltip title={t('editor.btn.h1')}>
              <IconButton
                size="small"
                color={editor.isActive('heading', {level: 1}) ? 'primary' : 'default'}
                onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
                sx={{fontSize: '0.85rem', fontWeight: 700}}
              >
                H1
              </IconButton>
            </Tooltip>
            <Tooltip title={t('editor.btn.h2')}>
              <IconButton
                size="small"
                color={editor.isActive('heading', {level: 2}) ? 'primary' : 'default'}
                onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
                sx={{fontSize: '0.85rem', fontWeight: 700}}
              >
                H2
              </IconButton>
            </Tooltip>
            <Tooltip title={t('editor.btn.h3')}>
              <IconButton
                size="small"
                color={editor.isActive('heading', {level: 3}) ? 'primary' : 'default'}
                onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
                sx={{fontSize: '0.85rem', fontWeight: 700}}
              >
                H3
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{mx: 0.5}}/>

            <Tooltip title={t('editor.btn.bullet_list')}>
              <IconButton
                size="small"
                color={editor.isActive('bulletList') ? 'primary' : 'default'}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <FormatListBulletedIcon fontSize="small"/>
              </IconButton>
            </Tooltip>
            <Tooltip title={t('editor.btn.ordered_list')}>
              <IconButton
                size="small"
                color={editor.isActive('orderedList') ? 'primary' : 'default'}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <FormatListNumberedIcon fontSize="small"/>
              </IconButton>
            </Tooltip>
            <Tooltip title={t('editor.btn.blockquote')}>
              <IconButton
                size="small"
                color={editor.isActive('blockquote') ? 'primary' : 'default'}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                <FormatQuoteIcon fontSize="small"/>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{mx: 0.5}}/>

            <Tooltip title={t('editor.btn.link')}>
              <IconButton size="small" color={editor.isActive('link') ? 'primary' : 'default'} onClick={openLinkDialog}>
                <LinkIcon fontSize="small"/>
              </IconButton>
            </Tooltip>
            <Tooltip title={t('editor.btn.unlink')}>
              <span>
                <IconButton size="small" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}>
                  <LinkOffIcon fontSize="small"/>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('editor.btn.image')}>
              <IconButton size="small" onClick={() => setImageDialogOpen(true)}>
                <ImageIcon fontSize="small"/>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{mx: 0.5}}/>

            <Tooltip title={t('editor.btn.clear')}>
              <IconButton size="small" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
                <FormatClearIcon fontSize="small"/>
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      <Box sx={{
        display: mode === 'wysiwyg' ? 'block' : 'none',
        '& .ProseMirror': {
          minHeight: `${minHeight}px`,
          padding: '12px',
          outline: 'none',
        },
        '& .ProseMirror p': {marginTop: 0, marginBottom: '8px'},
        '& .ProseMirror img': {maxWidth: '100%', height: 'auto'},
        '& .ProseMirror blockquote': {
          borderLeft: '3px solid',
          borderColor: 'divider',
          paddingLeft: '12px',
          marginLeft: 0,
          color: 'text.secondary',
        },
        '& .ProseMirror a': {color: 'primary.main', textDecoration: 'underline'},
      }}>
        <EditorContent editor={editor}/>
      </Box>

      <Box sx={{display: mode === 'html' ? 'block' : 'none'}}>
        <CodeMirror
          value={value}
          height={`${minHeight}px`}
          extensions={[cmHtml()]}
          onChange={(v) => {
            onChange(v);
            if (editor) editor.commands.setContent(v || '', false);
          }}
        />
      </Box>

      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('editor.dialog.link.title')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label={t('editor.dialog.link.url')}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://"
            onKeyDown={(e) => e.key === 'Enter' && applyLink()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>{t('messages.btn.cancel')}</Button>
          <Button onClick={applyLink} variant="contained">{t('messages.btn.apply')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('editor.dialog.image.title')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label={t('editor.dialog.image.url')}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.png"
          />
          <TextField
            fullWidth
            margin="dense"
            label={t('editor.dialog.image.alt')}
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>{t('messages.btn.cancel')}</Button>
          <Button onClick={applyImage} variant="contained" disabled={!imageUrl}>
            {t('messages.btn.insert')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RichHtmlEditor;
