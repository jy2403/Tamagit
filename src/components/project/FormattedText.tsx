import { useMemo } from 'react';
import { Text } from 'react-native';

type FormattedTextProps = {
  text: string;
  className?: string;
  numberOfLines?: number;
};

export function FormattedText({ text, className, numberOfLines }: FormattedTextProps) {
  const parts = useMemo(() => {
    // Soporta **negrita**, *cursiva*, `codigo` y saltos de línea.
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    return text.split(regex).map((token, i) => {
      if (/^\*\*.+\*\*$/.test(token)) {
        return (
          <Text key={i} className="font-bold">
            {token.slice(2, -2)}
          </Text>
        );
      }
      if (/^`.+`$/.test(token)) {
        return (
          <Text key={i} className="font-mono">
            {token.slice(1, -1)}
          </Text>
        );
      }
      if (/^\*.+\*$/.test(token)) {
        return (
          <Text key={i} className="italic">
            {token.slice(1, -1)}
          </Text>
        );
      }
      return token;
    });
  }, [text]);

  return (
    <Text className={className} numberOfLines={numberOfLines}>
      {parts}
    </Text>
  );
}
