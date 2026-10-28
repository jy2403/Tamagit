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
import { LineChart } from '@/components/clay/LineChart';
import { PetArena } from '@/components/clay/PetArena';
import { ScatterChart, type PuntoMascota } from '@/components/clay/ScatterChart';
import { StatDonut } from '@/components/clay/StatDonut';
import { useDashboard, type DashboardDia } from '@/hooks/useDashboard';
import { useProjects } from '@/hooks/useProjects';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { ArenaPet } from '@/hooks/usePetArenaScene';
import type { DiaSemana, Gradiente } from '@/estilos';
import { clay, colorMascotaPorId, fuentes, radios, SEMANA, sombras, tonoPorHex } from '@/estilos';
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
  const textColor = day.textoSobre;
  const outlineColor = textColor === '#FFFFFF' ? '#161616' : '#FFFFFF';

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

      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                fontFamily: fuentes.pixel,
                fontSize: 9,
                lineHeight: 15,
                color: textColor,
                textShadowColor: outlineColor,
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 0,
              }}>
              ESTA SEMANA
            </Text>
            <Text style={{ marginTop: 4, fontSize: 17, fontWeight: '900', color: textColor }}>
              {day.nombre}
            </Text>
          </View>
          <ClayPill
            label={`${totalCommits} commits`}
            colors={clay.negro}
            textColor="#FFFFFF"
            accessibilityLabel={`${totalCommits} commits esta semana`}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <ClaySurface
            colors={clay.negro}
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
                <Text style={{ fontSize: 8, color: '#B9B9C2' }}>Vida = tamaño</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 3 }}>
                <Legend color={clay.ambar[0]} label="Hambre" textColor="#D8D8DE" />
                <Legend color={clay.verde[0]} label="Felicidad" textColor="#D8D8DE" />
              </View>
              <View style={{ marginTop: 4 }}>
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

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
            gap: 8,
          }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: textColor, opacity: 0.9 }}>
            Buenas prácticas: {averageScore}%
          </Text>
          <Text style={{ fontSize: 9, color: textColor, opacity: 0.82 }}>
            {totalCommits === 0 ? 'Sin actividad todavía' : 'Sigue así'}
          </Text>
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
  const tones = tonoPorHex(petColor);
  const healthColor = pet.healthColor ?? petColor;
  const hungerColor = pet.hungerColor ?? tones[1];
  const happinessColor = pet.happinessColor ?? tones[0];

  return (
    <View style={sombras.tarjeta}>
      <ClaySurface colors={clay.blanco} radius={radios.tarjeta} border>
        <Pressable
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={`Abrir detalle de ${pet.name}, proyecto ${project.name}`}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: 12,
              minHeight: 112,
            },
            pressed ? { opacity: 0.86 } : null,
          ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 66,
                height: 78,
                borderRadius: 18,
                backgroundColor: '#F1F1F5',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
              <Image
                source={require('../../assets/mascota.png')}
                style={{ width: 62, height: 70 }}
                resizeMode="contain"
              />
            </View>
            <View style={{ gap: 2 }}>
              <View style={{ flexDirection: 'row', gap: 3 }}>
                <StatDonut
                  value={pet.health}
                  color={healthColor}
                  icon="♥"
                  label="Vida"
                  size={34}
                  strokeWidth={4}
                />
                <StatDonut
                  value={pet.hunger}
                  color={hungerColor}
                  icon="●"
                  label="Hambre"
                  size={34}
                  strokeWidth={4}
                />
                <StatDonut
                  value={pet.happiness}
                  color={happinessColor}
                  icon="☺"
                  label="Felicidad"
                  size={34}
                  strokeWidth={4}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 3 }}>
                {['Vida', 'Hambre', 'Feliz'].map((label) => (
                  <Text
                    key={label}
                    style={{ width: 34, textAlign: 'center', fontSize: 7, color: clay.textoTenue }}>
                    {label}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={{ flex: 1, minWidth: 0, alignSelf: 'stretch' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
              <Text
                numberOfLines={1}
                style={{ flex: 1, fontSize: 15, fontWeight: '900', color: clay.texto }}>
                {pet.name}
              </Text>
              <View style={{ marginTop: -4, marginRight: -4 }}>
                <ClayIconButton
                  icon="✎"
                  accessibilityLabel={`Editar ${pet.name}`}
                  onPress={onEdit}
                  size={40}
                  colors={clay.blanco}
                  iconColor={clay.texto}
                />
              </View>
            </View>
            <View style={{ alignSelf: 'flex-start', marginTop: 6, maxWidth: '100%' }}>
              <ClayPill
                label={project.name}
                colors={clay.negro}
                textColor="#FFFFFF"
                accessibilityLabel={`Proyecto: ${project.name}`}
              />
            </View>
            <Text numberOfLines={1} style={{ marginTop: 6, fontSize: 9, color: clay.textoTenue }}>
              {project.fullName ?? pet.lifeBranch}
            </Text>
          </View>
        </Pressable>
      </ClaySurface>
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
        <View style={{ alignItems: 'flex-end', maxWidth: 190 }}>
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
        </View>
        <View
          style={[
            sombras.suave,
            {
              width: 54,
              height: 54,
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
        style={[
          sombras.tarjeta,
          {
            height: 214,
            borderRadius: radios.tarjetaGrande,
            overflow: 'hidden',
            backgroundColor: '#E7E7EC',
          },
        ]}>
        {arenaPets.length > 0 ? (
          <PetArena pets={arenaPets} paused={!arenaVisible} onSelect={openArenaPet} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={{ fontSize: 26 }}>🥚</Text>
            <Text style={{ fontSize: 12, fontWeight: '800', color: clay.textoSuave }}>
              El escenario está esperando mascotas
            </Text>
          </View>
        )}
      </View>

      <Text style={{ marginTop: 6, marginBottom: 10, fontSize: 9, color: clay.textoTenue }}>
        {arenaPets.length > Math.min(10, arenaPets.length)
          ? 'Se muestran las primeras 10 mascotas en el escenario.'
          : `Caminando: ${Math.min(10, arenaPets.length)} de ${arenaPets.length}`}
      </Text>
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
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
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
          colors={clay.verde}
          textColor="#FFFFFF"
          accessibilityLabel="Crear nueva mascota"
          onPress={() => router.push('/nuevo' as Href)}
          icon={
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.32)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#FFFFFF' }}>+</Text>
            </View>
          }
        />
      </View>
    </ClayBackground>
  );
}
