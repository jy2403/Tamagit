import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Dish, Project } from '@/lib/types';
import { colorMascotaPorId, diaSemana, SEMANA } from '@/estilos';
import type { DiaGrafica } from '@/components/clay/LineChart';
import type { PuntoMascota } from '@/components/clay/ScatterChart';

export type DashboardDia = DiaGrafica & {
  fecha: Date;
  nombre: string;
  indice: number;
  key: string;
};

type Agregado = {
  commits: number;
  scores: number[];
};

const fechaKey = (fecha: Date) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(
    fecha.getDate()
  ).padStart(2, '0')}`;

function inicioSemana(ahora: Date) {
  const lunes = new Date(ahora);
  lunes.setDate(ahora.getDate() - ((ahora.getDay() + 6) % 7));
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

function construirSemana(ahora: Date, agregados: Record<string, Agregado>): DashboardDia[] {
  const lunes = inicioSemana(ahora);
  const hoyKey = fechaKey(ahora);

  return SEMANA.map((dia, posicion) => {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + posicion);
    const key = fechaKey(fecha);
    const agregado = agregados[key];
    const commits = agregado?.commits ?? 0;
    const scores = agregado?.scores ?? [];
    const score = scores.length
      ? scores.reduce((total, valor) => total + valor, 0) / scores.length
      : 0;

    return {
      inicial: dia.inicial,
      nombre: dia.nombre,
      indice: dia.indice,
      fecha,
      key,
      commits,
      score,
      tieneActividad: commits > 0,
      esHoy: key === hoyKey,
    };
  });
}

export function useDashboard(projects: Project[]) {
  const { token } = useAuth();
  const [agregados, setAgregados] = useState<Record<string, Agregado>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  const projectsRef = useRef(projects);
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    const conMascota = projectsRef.current.filter((project) => project.pet);
    if (conMascota.length === 0) {
      setAgregados({});
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const results = await Promise.allSettled(
      conMascota.map((project) => apiFetch<Dish[]>(`/projects/${project.id}/dishes`, { token }))
    );

    const siguiente: Record<string, Agregado> = {};
    let fallos = 0;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        fallos += 1;
        return;
      }
      result.value.forEach((dish) => {
        if (!dish.date) return;
        const fecha = new Date(dish.date);
        if (Number.isNaN(fecha.getTime())) return;
        const key = fechaKey(fecha);
        const actual = siguiente[key] ?? { commits: 0, scores: [] };
        actual.commits += 1;
        if (typeof dish.score === 'number') actual.scores.push(dish.score);
        siguiente[key] = actual;
      });
    });

    setAgregados(siguiente);
    setLoading(false);
    setError(fallos === results.length ? 'No se pudieron cargar las estadísticas' : null);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const days = useMemo(() => construirSemana(now, agregados), [now, agregados]);
  const hoy = diaSemana(now);

  const pets = useMemo<PuntoMascota[]>(
    () =>
      projects
        .filter((project) => project.pet)
        .map((project) => {
          const pet = project.pet!;
          return {
            id: pet.id,
            nombre: pet.name,
            hambre: pet.hunger,
            felicidad: pet.happiness,
            vida: pet.health,
            color: pet.bodyColor ?? colorMascotaPorId(pet.id).hex,
          };
        }),
    [projects]
  );

  return {
    days,
    pets,
    hoy,
    loading,
    error,
    reload: load,
  };
}
