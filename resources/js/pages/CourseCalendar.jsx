import { useMemo, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

function pad2(n) {
    return String(n).padStart(2, '0');
}

function toLocalDateKey(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Monday = 1 … Sunday = 7 (same as backend course_schedules.weekday) */
function jsDateToWeekday(date) {
    const js = date.getDay();
    return js === 0 ? 7 : js;
}

function normalizeTime(t) {
    if (t == null || t === '') return '';
    const s = String(t);
    return s.length >= 5 ? s.slice(0, 5) : s;
}

function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfWeekMonday(d) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
}

function addDays(d, n) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    x.setHours(0, 0, 0, 0);
    return x;
}

function addMonths(d, n) {
    const x = new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
    return x;
}

function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

/**
 * @param {Array} courses
 * @param {Date} rangeStart inclusive
 * @param {Date} rangeEnd inclusive
 */
function dateKeyWithinCourseSession(course, dateKey) {
    if (course.start_date && dateKey < String(course.start_date).slice(0, 10)) {
        return false;
    }
    if (course.end_date && dateKey > String(course.end_date).slice(0, 10)) {
        return false;
    }
    return true;
}

function collectOccurrences(courses, rangeStart, rangeEnd) {
    const list = [];
    const cur = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
    const end = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());

    while (cur <= end) {
        const wd = jsDateToWeekday(cur);
        const dateKey = toLocalDateKey(cur);

        for (const course of courses) {
            if (course.is_active === false) continue;
            if (!dateKeyWithinCourseSession(course, dateKey)) continue;
            for (const s of course.schedules || []) {
                if (Number(s.weekday) !== wd) continue;
                list.push({
                    dateKey,
                    date: new Date(cur),
                    courseId: course.id,
                    title: course.title,
                    type: course.type,
                    school: course.school,
                    start_time: normalizeTime(s.start_time),
                    end_time: normalizeTime(s.end_time),
                    teachers: course.teachers || [],
                });
            }
        }
        cur.setDate(cur.getDate() + 1);
    }

    list.sort((a, b) => {
        const c = a.dateKey.localeCompare(b.dateKey);
        if (c !== 0) return c;
        return a.start_time.localeCompare(b.start_time);
    });
    return list;
}

const WEEKDAY_LABELS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function OccurrencePill({ occ, dense }) {
    const teachers = occ.teachers?.map(t => t.name).filter(Boolean).join(', ');
    return (
        <div
            className={`rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100 ${
                dense ? 'px-1.5 py-0.5 text-[10px] leading-tight' : 'px-2 py-1.5 text-xs'
            }`}
        >
            <div className="font-semibold truncate">{occ.title}</div>
            <div className="opacity-90">
                {occ.start_time} – {occ.end_time}
            </div>
            {!dense && occ.school?.name && (
                <div className="text-slate-600 dark:text-slate-400 truncate text-[11px]">{occ.school.name}</div>
            )}
            {!dense && teachers && (
                <div className="text-slate-600 dark:text-slate-400 truncate text-[11px]">{teachers}</div>
            )}
        </div>
    );
}

export default function CourseCalendar() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [view, setView] = useState('week');
    const [focusDate, setFocusDate] = useState(() => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return t;
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError('');
                const { data } = await api.get('/courses');
                const raw = Array.isArray(data?.courses) ? data.courses : [];
                if (!cancelled) setCourses(raw);
            } catch (e) {
                if (!cancelled) setError(e.response?.data?.message || 'Impossible de charger les cours');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const visibleCourses = useMemo(() => {
        if (user?.role !== 'student') return courses;
        const ids = new Set((user?.enrolled_courses || []).map(c => c.id));
        return courses.filter(c => ids.has(c.id));
    }, [courses, user]);

    const { rangeStart, rangeEnd, title } = useMemo(() => {
        if (view === 'day') {
            return {
                rangeStart: focusDate,
                rangeEnd: focusDate,
                title: focusDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                }),
            };
        }
        if (view === 'week') {
            const start = startOfWeekMonday(focusDate);
            const end = addDays(start, 6);
            return {
                rangeStart: start,
                rangeEnd: end,
                title: `Semaine du ${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
            };
        }
        const first = startOfMonth(focusDate);
        const gridStart = startOfWeekMonday(first);
        const gridEnd = addDays(gridStart, 41);
        return {
            rangeStart: gridStart,
            rangeEnd: gridEnd,
            title: focusDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        };
    }, [view, focusDate]);

    const occurrences = useMemo(
        () => collectOccurrences(visibleCourses, rangeStart, rangeEnd),
        [visibleCourses, rangeStart, rangeEnd]
    );

    const byDateKey = useMemo(() => {
        const m = new Map();
        for (const o of occurrences) {
            if (!m.has(o.dateKey)) m.set(o.dateKey, []);
            m.get(o.dateKey).push(o);
        }
        return m;
    }, [occurrences]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goPrev = () => {
        if (view === 'day') setFocusDate(d => addDays(d, -1));
        else if (view === 'week') setFocusDate(d => addDays(d, -7));
        else setFocusDate(d => addMonths(d, -1));
    };

    const goNext = () => {
        if (view === 'day') setFocusDate(d => addDays(d, 1));
        else if (view === 'week') setFocusDate(d => addDays(d, 7));
        else setFocusDate(d => addMonths(d, 1));
    };

    const goToday = () => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        setFocusDate(t);
    };

    const weekDays = useMemo(() => {
        const start = startOfWeekMonday(focusDate);
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [focusDate]);

    const monthWeeks = useMemo(() => {
        const first = startOfMonth(focusDate);
        const gridStart = startOfWeekMonday(first);
        const weeks = [];
        let cur = new Date(gridStart);
        for (let w = 0; w < 6; w++) {
            const row = [];
            for (let d = 0; d < 7; d++) {
                row.push(new Date(cur));
                cur = addDays(cur, 1);
            }
            weeks.push(row);
        }
        return weeks;
    }, [focusDate]);

    if (loading) {
        return <div className="text-slate-500 dark:text-slate-400">Chargement du calendrier…</div>;
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Calendrier des cours</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Horaires récurrents par jour de la semaine (vue {view === 'day' ? 'jour' : view === 'week' ? 'semaine' : 'mois'}).
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['day', 'week', 'month'].map(v => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => setView(v)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                view === v
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                            }`}
                        >
                            {v === 'day' ? 'Jour' : v === 'week' ? 'Semaine' : 'Mois'}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={goPrev}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
                    >
                        ← Précédent
                    </button>
                    <button
                        type="button"
                        onClick={goNext}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
                    >
                        Suivant →
                    </button>
                    <button
                        type="button"
                        onClick={goToday}
                        className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium"
                    >
                        Aujourd’hui
                    </button>
                </div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white capitalize text-center sm:text-right flex-1 min-w-[12rem]">
                    {title}
                </h2>
            </div>

            {view === 'day' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[200px]">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        {occurrences.length} séance{occurrences.length !== 1 ? 's' : ''} prévue
                        {occurrences.length !== 1 ? 's' : ''}
                    </p>
                    {occurrences.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400">Aucun cours planifié ce jour.</p>
                    ) : (
                        <ul className="space-y-3">
                            {occurrences.map((occ, i) => (
                                <li key={`${occ.courseId}-${occ.start_time}-${i}`}>
                                    <OccurrencePill occ={occ} dense={false} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {view === 'week' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="grid grid-cols-7 min-w-[720px] divide-x divide-slate-200 dark:divide-slate-600">
                        {weekDays.map(d => {
                            const key = toLocalDateKey(d);
                            const dayOcc = byDateKey.get(key) || [];
                            const isToday = isSameDay(d, today);
                            return (
                                <div key={key} className="min-h-[280px] flex flex-col">
                                    <div
                                        className={`px-2 py-3 text-center border-b border-slate-200 dark:border-slate-600 ${
                                            isToday ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-slate-50 dark:bg-slate-900/50'
                                        }`}
                                    >
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {WEEKDAY_LABELS_SHORT[jsDateToWeekday(d) - 1]}
                                        </div>
                                        <div
                                            className={`text-lg font-bold ${
                                                isToday
                                                    ? 'text-indigo-700 dark:text-indigo-300'
                                                    : 'text-slate-800 dark:text-white'
                                            }`}
                                        >
                                            {d.getDate()}
                                        </div>
                                    </div>
                                    <div className="p-2 space-y-2 flex-1">
                                        {dayOcc.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-4">—</p>
                                        ) : (
                                            dayOcc.map((occ, i) => (
                                                <OccurrencePill
                                                    key={`${occ.courseId}-${occ.start_time}-${i}`}
                                                    occ={occ}
                                                    dense
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {view === 'month' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="min-w-[640px]">
                        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-600">
                            {WEEKDAY_LABELS_SHORT.map(l => (
                                <div
                                    key={l}
                                    className="py-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-400"
                                >
                                    {l}
                                </div>
                            ))}
                        </div>
                        {monthWeeks.map((row, wi) => (
                            <div
                                key={wi}
                                className="grid grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-slate-600 border-b border-slate-200 dark:border-slate-600 last:border-b-0"
                            >
                                {row.map(d => {
                                    const key = toLocalDateKey(d);
                                    const dayOcc = byDateKey.get(key) || [];
                                    const inMonth = d.getMonth() === focusDate.getMonth();
                                    const isToday = isSameDay(d, today);
                                    return (
                                        <div
                                            key={key}
                                            className={`min-h-[100px] p-1 flex flex-col ${
                                                inMonth ? '' : 'bg-slate-50/80 dark:bg-slate-900/40 opacity-70'
                                            } ${isToday ? 'ring-1 ring-inset ring-indigo-400' : ''}`}
                                        >
                                            <div
                                                className={`text-xs font-semibold mb-1 px-1 ${
                                                    isToday
                                                        ? 'text-indigo-600 dark:text-indigo-400'
                                                        : 'text-slate-700 dark:text-slate-300'
                                                }`}
                                            >
                                                {d.getDate()}
                                            </div>
                                            <div className="space-y-0.5 flex-1 overflow-hidden">
                                                {dayOcc.slice(0, 3).map((occ, i) => (
                                                    <div
                                                        key={`${occ.courseId}-${occ.start_time}-${i}`}
                                                        className="truncate text-[10px] leading-tight px-1 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100"
                                                        title={`${occ.title} ${occ.start_time}-${occ.end_time}`}
                                                    >
                                                        {occ.start_time} {occ.title}
                                                    </div>
                                                ))}
                                                {dayOcc.length > 3 && (
                                                    <div className="text-[10px] text-slate-500 px-1">
                                                        +{dayOcc.length - 3} autre{dayOcc.length - 3 > 1 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400">
                Les séances suivent l’horaire hebdomadaire du cours. Si une date de début ou de fin de session est renseignée sur
                le cours, les créneaux n’apparaissent qu’entre ces dates.
            </p>
        </div>
    );
}
