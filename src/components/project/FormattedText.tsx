import { useMemo, type ReactNode } from 'react';
import { Platform, Text, type StyleProp, type TextStyle } from 'react-native';

type FormattedTextProps = {
  text: string;
  className?: string;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
};

const TOKEN_RE =
  /(\*\*[^*\n]+\*\*|__[^_\n]+__|~~[^~\n]+~~|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_|\*\*[^*\n]+$|__[^_\n]+$)/g;

const CODE_FONT = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

function normalizeMarkdown(text: string) {
  return text
    .replace(/\\n/g, '\n')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ');
}

export function FormattedText({ text, className, numberOfLines, style }: FormattedTextProps) {
  const parts = useMemo<ReactNode[]>(() => {
    const normalized = normalizeMarkdown(text);
    return normalized.split(TOKEN_RE).map((token, index) => {
      if (!token) return null;

      if (/^\*\*[^*]+\*\*$/.test(token) || /^__[^_]+__$/.test(token)) {
        return (
          <Text key={index} style={{ fontWeight: '800' }}>
            {token.slice(2, -2)}
          </Text>
        );
      }

      if (/^~~[^~]+~~$/.test(token)) {
        return (
          <Text key={index} style={{ textDecorationLine: 'line-through' }}>
            {token.slice(2, -2)}
          </Text>
        );
      }

      if (/^`[^`]+`$/.test(token)) {
        return (
          <Text
            key={index}
            style={{
              fontFamily: CODE_FONT,
              color: '#8B4FF8',
            }}>
            {token.slice(1, -1)}
          </Text>
        );
      }

      if (/^\*[^*]+\*$/.test(token) || /^_[^_]+_$/.test(token)) {
        return (
          <Text key={index} style={{ fontStyle: 'italic' }}>
            {token.slice(1, -1)}
          </Text>
        );
      }

      // La IA a veces abre negrita y no la cierra: la mostramos como negrita hasta el final.
      if (/^\*\*[^*]+$/.test(token) || /^__[^_]+$/.test(token)) {
        return (
          <Text key={index} style={{ fontWeight: '800' }}>
            {token.slice(2)}
          </Text>
        );
      }

      return token.replace(/\*\*|~~/g, '');
    });
  }, [text]);

  return (
    <Text className={className} style={style} numberOfLines={numberOfLines}>
      {parts}
    </Text>
  );
}
