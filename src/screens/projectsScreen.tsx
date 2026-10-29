import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation, useRouter, Redirect, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { IconoImagen } from '@/components/clay/IconoImagen';
import { StatDonut } from '@/components/clay/StatDonut';
import { LineChart } from '@/components/clay/LineChart';
import { PetArena } from '@/components/clay/PetArena';
import { ScatterChart, type PuntoMascota } from '@/components/clay/ScatterChart';
import { PetAvatar } from '@/components/project/PetAvatar';
import { useDashboard, type DashboardDia } from '@/hooks/useDashboard';
import { useProjects } from '@/hooks/useProjects';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { ArenaPet } from '@/hooks/usePetArenaScene';
import type { DiaSemana, Gradiente } from '@/estilos';
import { clay, colorMascotaPorId, fuentes, radios, SEMANA, sombras } from '@/estilos';
import { readableStatColor } from '@/lib/color';
import type { Pet, Project } from '@/lib/types';

type ProjectWithPet = Project & { pet: Pet };

const SEMANA_POR_INDICE = new Map(SEMANA.map((dia) => [dia.indice, dia]));

function WeeklyHero({
  day,
  days,
  points,
  loading,
}: {
  day: DiaSemana;
  days: DashboardDia[];
  points: PuntoMascota[];
  loading: boolean;
}) {
  const [previous, setPrevious] = useState<Gradiente>(day.gradiente);
  const [current, setCurrent] = useState<Gradiente>(day.gradiente);
  const [progress] = useState(() => new Animated.Value(1));
  const keyRef = useRef(day.indice);

  useEffect(() => {
    if (keyRef.current === day.indice) return;
    keyRef.current = day.indice;
    setPrevious(current);
    setCurrent(day.gradiente);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [current, day.gradiente, day.indice, progress]);

  const totalCommits = days.reduce((total, item) => total + item.commits, 0);
  const scoreDays = days.filter((item) => item.tieneActividad);
  const averageScore = scoreDays.length
    ? Math.round(scoreDays.reduce((total, item) => total + item.score, 0) / scoreDays.length)
    : 0;
  return (
    <View
      style={[
        sombras.tarjeta,
        {
          borderRadius: radios.tarjetaGrande,
          backgroundColor: current[1],
          overflow: 'visible',
        },
      ]}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
        ]}>
        <ClaySurface
          colors={previous}
          radius={radios.tarjetaGrande}
          style={StyleSheet.absoluteFill}
          border
        />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: progress }]}>
        <ClaySurface
          colors={current}
          radius={radios.tarjetaGrande}
          style={StyleSheet.absoluteFill}
          border
        />
      </Animated.View>

      <View style={{ padding: 14 }}>
        <View>
          <ClaySurface
            colors={clay.panelOscuro}
            radius={radios.chip}
            contentStyle={{ flexDirection: 'row', gap: 4, padding: 7 }}>
            {days.map((item) => {
              const meta = SEMANA_POR_INDICE.get(item.indice) ?? SEMANA[0];
              const active = item.tieneActividad;
              return (
                <View
                  key={item.key}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={`${meta.nombre}: ${item.commits} commits${
                    item.esHoy ? ', hoy' : ''
                  }${active ? '' : ', sin actividad'}`}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    transform: [{ scale: item.esHoy ? 1.06 : 1 }],
                    padding: item.esHoy ? 1 : 0,
                  }}>
                  <ClaySurface
                    colors={active ? meta.gradiente : clay.blanco}
                    radius={10}
                    shadow={active ? 'suave' : false}
                    style={{ flex: 1, borderWidth: item.esHoy ? 2 : 0, borderColor: '#FFFFFF' }}
                    contentStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text
                      style={{
                        fontFamily: fuentes.pixel,
                        fontSize: 8,
                        lineHeight: 13,
                        color: active ? meta.textoSobre : clay.textoTenue,
                      }}>
                      {meta.inicial}
                    </Text>
                  </ClaySurface>
                  {item.esHoy ? (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: -5,
                        alignSelf: 'center',
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                  ) : null}
                </View>
              );
            })}
          </ClaySurface>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <View style={[{ flex: 1 }, sombras.suave]}>
            <ClaySurface
              colors={clay.blanco}
              radius={radios.chip}
              border
              contentStyle={{ padding: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={{ fontSize: 10, fontWeight: '900', color: clay.texto }}>
                  Actividad
                </Text>
                {loading ? <ActivityIndicator size="small" color={clay.textoSuave} /> : null}
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 3 }}>
                <Legend color={clay.naranja[0]} label="Commits" textColor={clay.textoSuave} />
                <Legend color={clay.violeta[0]} label="Prácticas" textColor={clay.textoSuave} />
              </View>
              <View style={{ marginTop: 4 }}>
                <LineChart data={days} height={84} />
              </View>
            </ClaySurface>
          </View>

          <View style={[{ flex: 1 }, sombras.suave]}>
            <ClaySurface
              colors={clay.panelOscuro}
              radius={radios.chip}
              border
              contentStyle={{ padding: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={{ fontSize: 10, fontWeight: '900', color: '#FFFFFF' }}>Mascotas</Text>
              </View>
              <View style={{ marginTop: 7 }}>
                {points.length > 0 ? (
                  <ScatterChart data={points} height={84} />
                ) : (
                  <View
                    style={{
                      height: 84,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text style={{ fontSize: 9, color: '#B9B9C2' }}>Aún sin mascotas</Text>
                  </View>
                )}
              </View>
            </ClaySurface>
          </View>
        </View>

        {/* Tarjeta claymorfista pequeña con Buenas Prácticas y Commits */}
        <View style={{ marginTop: 12 }}>
          <ClaySurface
            colors={clay.panelOscuro}
            radius={radios.chip}
            shadow="suave"
            border
            contentStyle={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              paddingVertical: 10,
              paddingHorizontal: 14,
            }}>
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: '800',
                  color: '#D8D8DE',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                Buenas prácticas
              </Text>
              <Text style={{ marginTop: 2, fontSize: 15, fontWeight: '900', color: '#FFFFFF' }}>
                {averageScore}%
              </Text>
            </View>
            <View style={{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: '800',
                  color: '#D8D8DE',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                Commits
              </Text>
              <Text style={{ marginTop: 2, fontSize: 15, fontWeight: '900', color: '#FFFFFF' }}>
                {totalCommits}
              </Text>
            </View>
          </ClaySurface>
        </View>
      </View>
    </View>
  );
}

function Legend({ color, label, textColor }: { color: string; label: string; textColor: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <Text style={{ fontSize: 7, fontWeight: '700', color: textColor }}>{label}</Text>
    </View>
  );
}

const OBLONG_HEIGHT = 54;

function PetCard({
  project,
  onOpen,
  onEdit,
}: {
  project: ProjectWithPet;
  onOpen: () => void;
  onEdit: () => void;
}) {
  const pet = project.pet;
  const petColor = pet.bodyColor ?? colorMascotaPorId(pet.id).hex;
  const statColor = readableStatColor(petColor);
  const stats = [
    { icon: 'hambre' as const, label: 'Comida', value: pet.hunger, zIndex: 3 },
    { icon: 'vida' as const, label: 'Vida', value: pet.health, zIndex: 2 },
    { icon: 'felicidad' as const, label: 'Felicidad', value: pet.happiness, zIndex: 1 },
  ];

  return (
    <View style={[sombras.suave, { position: 'relative' }]}>
      <ClaySurface
        colors={clay.blanco}
        radius={OBLONG_HEIGHT / 2}
        border
        style={{ height: OBLONG_HEIGHT, overflow: 'hidden' }}
        contentStyle={{ height: OBLONG_HEIGHT }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: OBLONG_HEIGHT,
            paddingRight: 10,
          }}>
          <Pressable
            onPress={onOpen}
            accessibilityRole="button"
            accessibilityLabel={`Abrir detalle de ${pet.name}, proyecto ${project.name}`}
            style={({ pressed }) => [
              {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                height: OBLONG_HEIGHT,
                minWidth: 0,
              },
              pressed ? { opacity: 0.9 } : null,
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
              <View style={{ zIndex: 4 }}>
                <PetAvatar pet={pet} size={OBLONG_HEIGHT} shadow={false} />
              </View>

              {stats.map((stat) => (
                <View key={stat.icon} style={{ marginLeft: -18, zIndex: stat.zIndex }}>
                  <StatDonut
                    value={stat.value}
                    color={statColor}
                    icon={stat.icon}
                    label={stat.label}
                    size={OBLONG_HEIGHT}
                    strokeWidth={9}
                    trackColor="#FFFFFF"
                    innerBg="#E1E1EA"
                    iconColor="#FFFFFF"
                    shadow={false}
                    linecap="butt"
                  />
                </View>
              ))}
            </View>
          </Pressable>

          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: OBLONG_HEIGHT * 3 - 3 * 18 + 4,
              right: 44,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'flex-end',
              zIndex: 30,
            }}>
            <Text
              numberOfLines={1}
              style={{
                width: '100%',
                fontSize: 16,
                fontWeight: '900',
                color: '#111115',
                textAlign: 'right',
              }}>
              {pet.name}
            </Text>
            <View
              style={{
                backgroundColor: '#111115',
                borderRadius: 9999,
                paddingHorizontal: 10,
                paddingVertical: 2.5,
                marginTop: 2,
                maxWidth: '100%',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: '900',
                }}>
                {project.name}
              </Text>
            </View>
          </View>
        </View>
      </ClaySurface>

      {/* Botón editar: arriba a la derecha, sin recuadro */}
      <Pressable
  hitSlop={10}
  onPress={onEdit}
  accessibilityRole="button"
  accessibilityLabel={`Editar ${pet.name}`}
  style={{
    position: 'absolute',
    top: 4,
    right: 12,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 40,
  }}>
  <IconoImagen nombre="editar" size={18} tintColor="#333338" />
</Pressable>
    </View>
  );
}

export default function ProjectsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const openMenu = useCallback(() => {
    const drawer = navigation as unknown as { openDrawer?: () => void };
    drawer.openDrawer?.();
  }, [navigation]);
  const openProfile = useCallback(() => {
    router.push('/profile' as Href);
  }, [router]);
  const authStatus = useRequireAuth();
  const insets = useSafeAreaInsets();
  const { height: viewportHeight } = useWindowDimensions();
  const { projects, pets: projectPets, loading, refreshing, error, onRefresh } = useProjects();
  const {
    days,
    pets: points,
    hoy,
    loading: dashboardLoading,
    error: dashboardError,
    reload,
  } = useDashboard(projects);

  const [arenaVisible, setArenaVisible] = useState(true);
  const arenaRef = useRef({ y: 0, height: 0 });

  const withPet = useMemo(
    () => projects.filter((project): project is ProjectWithPet => project.pet !== null),
    [projects]
  );

  const arenaPets = useMemo<ArenaPet[]>(
    () =>
      withPet.map((project) => ({
        id: project.pet.id,
        name: project.pet.name,
        projectId: project.id,
        bodyColor: project.pet.bodyColor,
      })),
    [withPet]
  );

  const openProject = useCallback(
    (project: ProjectWithPet) => {
      router.push({
        pathname: '/project/[id]',
        params: {
          id: String(project.id),
          fullName: project.fullName ?? '',
          name: project.pet.name,
        },
      });
    },
    [router]
  );

  const openArenaPet = useCallback(
    (pet: ArenaPet) => {
      const project = withPet.find((item) => item.id === pet.projectId);
      if (!project) return;
      router.push({
        pathname: '/project/[id]',
        params: {
          id: String(project.id),
          fullName: project.fullName ?? '',
          name: project.pet.name,
        },
      });
    },
    [router, withPet]
  );

  const refresh = useCallback(() => {
    onRefresh();
    void reload();
  }, [onRefresh, reload]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.y;
      const arena = arenaRef.current;
      if (arena.height === 0) return;
      const visible = offset < arena.y + arena.height && offset + viewportHeight > arena.y;
      setArenaVisible((current) => (current === visible ? current : visible));
    },
    [viewportHeight]
  );

  if (authStatus === 'loading') {
    return (
      <ClayBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={clay.violeta[0]} />
        </View>
      </ClayBackground>
    );
  }

  if (authStatus === 'anonymous') {
    return <Redirect href="/login" />;
  }

  const role = user?.isAdmin ? 'Administrador' : 'Programador';

  const header = (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <ClayIconButton
          icon="☰"
          accessibilityLabel="Abrir menú lateral"
          onPress={openMenu}
          size={50}
        />
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={openProfile}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Abrir mi perfil"
          style={({ pressed }) => [
            { alignItems: 'flex-end', flexShrink: 1, minWidth: 0, maxWidth: 155 },
            pressed ? { opacity: 0.7 } : null,
          ]}>
          <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '900', color: clay.texto }}>
            {user?.name || user?.githubUsername || 'TamaGit'}
          </Text>
          <View style={{ marginTop: 4 }}>
            <ClayPill
              label={role}
              colors={user?.isAdmin ? clay.ambar : clay.blanco}
              textColor={user?.isAdmin ? '#1A1A1C' : clay.texto}
              accessibilityLabel={`Rol: ${role}`}
            />
          </View>
        </Pressable>
        <View style={{ width: 54, height: 54, flexShrink: 0 }}>
          <View
            style={[
              sombras.suave,
              {
                flex: 1,
                borderRadius: 27,
                padding: 3,
                backgroundColor: '#FFFFFF',
              },
            ]}>
            <View
              style={{
                flex: 1,
                borderRadius: 24,
                overflow: 'hidden',
                backgroundColor: '#F0F0F3',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../../assets/github-icon.webp')}
                  style={{ width: '80%', height: '80%' }}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>
          <Pressable
            onPress={openProfile}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Abrir mi perfil"
            style={({ pressed }) => [
              StyleSheet.absoluteFill,
              { borderRadius: 27 },
              pressed ? { opacity: 0.7 } : null,
            ]}
          />
        </View>
      </View>
    </View>
  );

  const listHeader = (
    <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
      <WeeklyHero day={hoy} days={days} points={points} loading={dashboardLoading} />

      {dashboardError ? (
        <Text style={{ marginTop: 6, fontSize: 10, color: clay.textoSuave }}>{dashboardError}</Text>
      ) : null}
      {error ? <Text style={{ marginTop: 6, fontSize: 10, color: '#B4221B' }}>{error}</Text> : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 18,
          marginBottom: 8,
        }}>
        <View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: clay.texto }}>Mis mascotas</Text>
          <Text style={{ fontSize: 10, color: clay.textoSuave, marginTop: 2 }}>
            Toca una para verla de cerca
          </Text>
        </View>
        <ClayPill
          label={`${projectPets.length}`}
          colors={clay.negro}
          textColor="#FFFFFF"
          accessibilityLabel={`${projectPets.length} mascotas`}
        />
      </View>

      <View
        onLayout={(event) => {
          arenaRef.current = {
            y: event.nativeEvent.layout.y,
            height: event.nativeEvent.layout.height,
          };
        }}
        style={{
          height: 214,
          overflow: 'hidden',
          marginVertical: 4,
        }}>
        {arenaPets.length > 0 ? (
          <PetArena pets={arenaPets} paused={!arenaVisible} onSelect={openArenaPet} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <IconoImagen nombre="huevo" size={36} tintColor={clay.textoSuave} />
            <Text style={{ fontSize: 12, fontWeight: '800', color: clay.textoSuave }}>
              El escenario está esperando mascotas
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ClayBackground>
      {header}
      {loading && projects.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={clay.violeta[0]} />
        </View>
      ) : (
        <FlatList
          data={withPet}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 }}>
              <PetCard
                project={item}
                onOpen={() => openProject(item)}
                onEdit={() =>
                  router.push({
                    pathname: '/editar/[id]',
                    params: {
                      id: String(item.id),
                      petName: item.pet.name,
                    },
                  })
                }
              />
            </View>
          )}
          ListHeaderComponent={listHeader}
          ListFooterComponent={<View style={{ height: 120 }} />}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={clay.violeta[0]}
            />
          }
        />
      )}

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 10,
        }}>
        <ClayButton
          title="Nuevo"
          colors={clay.fucsia}
          textColor="#FFFFFF"
          pixel
          outline={false}
          accessibilityLabel="Crear nueva mascota"
          onPress={() => router.push('/nuevo' as Href)}
          iconRight={<IconoImagen nombre="huevo" size={26} tintColor="#FFFFFF" />}
        />
      </View>
    </ClayBackground>
  );
}
