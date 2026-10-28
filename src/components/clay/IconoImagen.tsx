import { type StyleProp, type ViewStyle, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { paleta } from '@/estilos';

export type NombreIcono =
  | 'vida'
  | 'hambre'
  | 'felicidad'
  | 'editar'
  | 'huevo'
  | 'perchero'
  | 'volver'
  | 'salir'
  | 'home'
  | 'usuario'
  | 'engranaje'
  // Alias en inglés o descriptivos
  | 'corazon'
  | 'manzana'
  | 'feliz'
  | 'vestir'
  | 'atras'
  | 'perfil'
  | 'admin'
  | 'door';

type IconoImagenProps = {
  nombre: NombreIcono;
  size?: number;
  tintColor?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function IconoImagen({
  nombre,
  size = 24,
  tintColor,
  color,
  style,
}: IconoImagenProps) {
  const c = tintColor ?? color ?? paleta.vino.base;

  switch (nombre) {
    case 'vida':
    case 'corazon':
      return (
        <View style={[{ width: size, height: size }, style]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <G fill="none">
              <Path
                fill={c}
                fillOpacity={0.25}
                d="M17.25 3.35c-1.8 0-3.27.9-4.23 1.8c-.55.52-.82.78-1.02.78s-.47-.26-1.02-.78a6.3 6.3 0 0 0-4.23-1.8C3.4 3.35.88 7.17 1.96 11.2c1.03 3.85 5.67 7.26 9.5 9.85c.26.18.39.27.54.27s.29-.09.55-.27c3.93-2.58 8.46-6 9.49-9.85c1.08-4.04-1.44-7.86-4.79-7.86"
              />
              <Path
                stroke={c}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 3.35c-1.8 0-3.27.9-4.23 1.8c-.55.52-.82.78-1.02.78s-.47-.26-1.02-.78a6.3 6.3 0 0 0-4.23-1.8C3.4 3.35.88 7.17 1.96 11.2c1.05 3.9 4.7 6.88 9.53 9.9c.25.15.37.23.51.23s.27-.07.52-.22c5.28-3.17 8.47-6 9.52-9.91c1.08-4.04-1.44-7.86-4.79-7.86"
              />
            </G>
          </Svg>
        </View>
      );

    case 'hambre':
    case 'manzana':
      return (
        <View style={[{ width: size, height: size }, style]}>
          <Svg width={size} height={size} viewBox="0 0 448 512">
            <Path
              fill={c}
              d="M224 112c-8.8 0-16-7.2-16-16V80c0-44.2 35.8-80 80-80h16c8.8 0 16 7.2 16 16v16c0 44.2-35.8 80-80 80zM0 288c0-76.3 35.7-160 112-160c27.3 0 59.7 10.3 82.7 19.3c18.8 7.3 39.9 7.3 58.7 0c22.9-8.9 55.4-19.3 82.7-19.3c76.3 0 112 83.7 112 160c0 128-80 224-160 224c-16.5 0-38.1-6.6-51.5-11.3c-8.1-2.8-16.9-2.8-25 0c-13.4 4.7-35 11.3-51.5 11.3C80 512 0 416 0 288"
            />
          </Svg>
        </View>
      );

    case 'felicidad':
    case 'feliz':
      return (
        <View style={[{ width: size, height: size }, style]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
              fill={c}
              d="M12 2C6.485 2 2 6.485 2 12s4.485 10 10 10s10-4.485 10-10S17.515 2 12 2M6.5 9.5C6.5 8.67 7.17 8 8 8s1.5.67 1.5 1.5S8.83 11 8 11s-1.5-.67-1.5-1.5m8.985 4.27A3.514 3.514 0 0 1 12 17a3.51 3.51 0 0 1-3.485-3.23l-.02-.27h7.015l-.02.27zM16 11c-.83 0-1.5-.67-1.5-1.5S15.17 8 16 8s1.5.67 1.5 1.5S16.83 11 16 11"
            />
          </Svg>
        </View>
      );

    case 'editar':
      return (
        <View style={[{ width: size, height: size }, style]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
              fill={c}
              d="M3.995 17.207V19.5a.5.5 0 0 0 .5.5h2.298a.5.5 0 0 0 .353-.146l9.448-9.448l-3-3l-9.452 9.448a.5.5 0 0 0-.147.353m10.837-11.04l3 3l1.46-1.46a1 1 0 0 0 0-1.414l-1.585-1.586a1 1 0 0 0-1.414 0z"
            />
          </Svg>
        </View>
      );

    case 'huevo':
      return (
        <View style={[{ width: size, height: size }, style]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <G fill="none">
              <Path
                fill={c}
                fillOpacity={0.25}
                d="M19.95 12.12c0 5.6 0 10.13-7.95 10.13S4.05 17.7 4.05 12.12C4.91 6.48 7.61 1.99 12 1.99s7.2 4.28 7.95 10.13"
              />
              <Path
                stroke={c}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.31 13.75c0 5.66-3.72 8.5-8.31 8.5s-8.31-2.84-8.31-8.5s4.24-12 8.31-12s8.31 6.34 8.31 12"
              />
            </G>
          </Svg>
        </View>
      );

    case 'perchero':
    case 'vestir':
      return (
        <View style={[{ width: size, height: size }, style]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
              fill={c}
              d="M12 4.5a1.5 1.5 0 0 0-1.376.9a1 1 0 0 1-1.832-.8q.165-.376.408-.7a3.5 3.5 0 1 1 4.294 5.266a1.3 1.3 0 0 0-.414.293c-.08.092-.08.137-.08.142c0 .037.02.072.052.09l7.543 4.19A2.731 2.731 0 0 1 19.27 19H4.743a2.743 2.743 0 0 1-1.37-5.12L9 10.635a1 1 0 0 1 1 1.732l-5.628 3.247A.743.743 0 0 0 4.743 17H19.27a.731.731 0 0 0 .355-1.37l-7.543-4.191A2.1 2.1 0 0 1 11 9.602c0-1.208.984-1.935 1.64-2.244A1.5 1.5 0 0 0 12 4.5"
            />
          </Svg>
        </View>
      );

    case 'volver':
    case 'atras':
      return (
        <View style={[{ width: size, height: size }, style]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
              fill={c}
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 2a1 1 0 0 0-1.79-.614l-7 9a1 1 0 0 0 0 1.228l7 9A1 1 0 0 0 10 20v-3.99c5.379.112 7.963 1.133 9.261 2.243c1.234 1.055 1.46 2.296 1.695 3.596l.061.335a1 1 0 0 0 1.981-.122c.171-2.748-.086-6.73-2.027-10.061C19.087 8.768 15.695 6.282 10 6.022z"
            />
          </Svg>
        </View>
      );

    case 'salir':
    case 'door':
      return (
        <View style={[{ width: size, height: size }, style]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <G fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
              <Path d="M5 2h11a3 3 0 0 1 3 3v14a1 1 0 0 1-1 1h-3" />
              <Path d="m5 2l7.588 1.518A3 3 0 0 1 15 6.459V20.78a1 1 0 0 1-1.196.98l-7.196-1.438A2 2 0 0 1 5 18.36zm7 10v2" />
            </G>
          </Svg>
        </View>
      );

    case 'home':
      return (
        <View style={[{ width: size, height: size }, style]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
              fill={c}
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.0605 2.7073C10.6025 2.2482 11.2897 1.9963 12 1.9963C12.7103 1.9963 13.3975 2.2482 13.9395 2.7073L20.9395 8.6379L21.0615 8.7483C21.6604 9.3147 21.9998 10.1027 22 10.927L22 19.0002C21.9999 20.657 20.6568 22.0001 19 22.0002L5 22.0002C3.3432 22.0001 2.0001 20.657 2 19.0002L2 10.927C2 10.0452 2.3879 9.208 3.0606 8.6379L10.0605 2.7073ZM10 10.5C10 9.9477 9.5523 9.5 9 9.5C8.4477 9.5 8 9.9477 8 10.5L8 11.5C8 12.0523 8.4477 12.5 9 12.5C9.5523 12.5 10 12.0523 10 11.5L10 10.5ZM16 10.5C16 9.9477 15.5523 9.5 15 9.5C14.4477 9.5 14 9.9477 14 10.5L14 11.5C14 12.0523 14.4477 12.5 15 12.5C15.5523 12.5 16 12.0523 16 11.5L16 10.5ZM9.7071 14.7929C9.5196 14.6054 9.2652 14.5 9 14.5C8.4477 14.5 8 14.9477 8 15.5C8 15.7652 8.1054 16.0196 8.2929 16.2071C8.5605 16.4768 8.847 16.7271 9.15 16.9563C9.4334 17.1707 9.7356 17.3592 10.0528 17.5194C10.357 17.6729 10.6772 17.7926 11.0075 17.8764C11.3319 17.9585 11.6653 18 12 18C12.3347 18 12.6681 17.9585 12.9925 17.8764C13.3228 17.7926 13.643 17.6729 13.9472 17.5194C14.2644 17.3592 14.5666 17.1707 14.85 16.9563C15.153 16.7271 15.4395 16.4768 15.7071 16.2071C15.8946 16.0196 16 15.7652 16 15.5C16 14.9477 15.5523 14.5 15 14.5C14.7348 14.5 14.4804 14.6054 14.2929 14.7929C14.0922 14.9956 13.8773 15.1839 13.65 15.3563C13.4625 15.4987 13.2627 15.6239 13.0528 15.7306C12.8791 15.8188 12.6962 15.8877 12.5075 15.9361C12.3416 15.9785 12.1712 16 12 16C11.8288 16 11.6584 15.9785 11.4925 15.9361C11.3038 15.8877 11.1209 15.8188 10.9472 15.7306C10.7373 15.6239 10.5375 15.4987 10.35 15.3563C10.1227 15.1839 9.9078 14.9956 9.7071 14.7929Z"
            />
          </Svg>
        </View>
      );

    case 'usuario':
    case 'perfil':
      return (
        <View style={[{ width: size, height: size }, style]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <G fill="none">
              <Path
                fill={c}
                fillOpacity={0.25}
                d="M17.35 7.9a5.35 5.35 0 1 1-10.7 0a5.35 5.35 0 0 1 10.7 0M20.3 21.72H3.7a8.4 8.4 0 0 1 8.3-8.46c4.59 0 8.3 3.79 8.3 8.46"
              />
              <Path
                stroke={c}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.35 7.9A5.33 5.33 0 0 1 12 13.27a5.35 5.35 0 1 1 5.35-5.35M20.3 21.56a8.3 8.3 0 0 0-16.6 0"
              />
            </G>
          </Svg>
        </View>
      );

    case 'engranaje':
    case 'admin':
      return (
        <View style={[{ width: size, height: size }, style]}>
          <Svg width={size} height={size} viewBox="0 0 256 256">
            <Path
              fill={c}
              d="M232 116h-12.78A91 91 0 0 0 213 92.79l11.08-6.4a12 12 0 1 0-12-20.78L201 72a93 93 0 0 0-17-17l6.41-11.11a12 12 0 1 0-20.78-12L163.21 43A91 91 0 0 0 140 36.78V24a12 12 0 0 0-24 0v12.78A91 91 0 0 0 92.79 43l-6.4-11.08a12 12 0 0 0-20.78 12L72 55a93 93 0 0 0-17 17l-11.07-6.39a12 12 0 0 0-12 20.78L43 92.79A91 91 0 0 0 36.78 116H24a12 12 0 0 0 0 24h12.78A91 91 0 0 0 43 163.21l-11.08 6.4a12 12 0 1 0 12 20.78L55 184a93 93 0 0 0 17 17l-6.41 11.11a12 12 0 1 0 20.78 12L92.79 213a91 91 0 0 0 23.21 6.22V232a12 12 0 0 0 24 0v-12.78a91 91 0 0 0 23.21-6.22l6.4 11.08a12 12 0 0 0 20.78-12L184 201a93 93 0 0 0 17-17l11.11 6.41a12 12 0 1 0 12-20.78L213 163.21a91 91 0 0 0 6.22-23.21H232a12 12 0 0 0 0-24M128 60a68.1 68.1 0 0 1 66.92 56h-60l-30-52A67.6 67.6 0 0 1 128 60m-68 68a67.9 67.9 0 0 1 24.16-51.93l30 51.93l-30 51.93A67.9 67.9 0 0 1 60 128m68 68a67.6 67.6 0 0 1-23.07-4l30-52h60A68.1 68.1 0 0 1 128 196"
            />
          </Svg>
        </View>
      );
  }
}
