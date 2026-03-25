import { useState, useEffect } from 'react';
import api from '../../api';

const COURSE_TYPES = [
    { value: 'communication', label: 'Communication' },
    { value: 'langue', label: 'Langue' },
];

const WEEKDAYS = [
    { value: 1, label: 'Lun', full: 'Lundi' },
    { value: 2, label: 'Mar', full: 'Mardi' },
    { value: 3, label: 'Mer', full: 'Mercredi' },
    { value: 4, label: 'Jeu', full: 'Jeudi' },
    { value: 5, label: 'Ven', full: 'Vendredi' },
    { value: 6, label: 'Sam', full: 'Samedi' },
    { value: 7, label: 'Dim', full: 'Dimanche' },
];

function normalizeTimeInput(t) {
    if (t == null || t === '') return '';
    const s = String(t);
    return s.length >= 5 ? s.slice(0, 5) : s;
}

function newScheduleSlot(overrides = {}) {
    return {
        _key: globalThis.crypto?.randomUUID?.() ?? `k-${Date.now()}-${Math.random()}`,
        weekday: 1,
        start_time: '09:00',
        end_time: '10:00',
        ...overrides,
    };
}

function schedulesToPayload(slots) {
    return slots.map(({ weekday, start_time, end_time }) => ({
        weekday: Number(weekday),
        start_time: normalizeTimeInput(start_time),
        end_time: normalizeTimeInput(end_time),
    }));
}

function formatScheduleSummary(schedules) {
    if (!schedules?.length) return '—';
    const byDay = (d) => WEEKDAYS.find(w => w.value === d)?.label ?? d;
    const sorted = [...schedules].sort(
        (a, b) => a.weekday - b.weekday || String(a.start_time).localeCompare(String(b.start_time))
    );
    return sorted
        .map(s => `${byDay(s.weekday)} ${normalizeTimeInput(s.start_time)}–${normalizeTimeInput(s.end_time)}`)
        .join(', ');
}

export default function CoursesList() {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        school_id: '',
        title: '',
        type: 'communication',
        description: '',
        start_date: '',
        end_date: '',
        teacher_ids: [],
        max_students: 30,
        is_active: true,
        schedules: [],
    });
    const [seriesStart, setSeriesStart] = useState('09:00');
    const [seriesEnd, setSeriesEnd] = useState('10:00');
    const [seriesDayMask, setSeriesDayMask] = useState(() => ({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 7: false }));
    const [copyFromDay, setCopyFromDay] = useState(1);
    const [copyToMask, setCopyToMask] = useState(() => ({ 1: false, 2: true, 3: true, 4: true, 5: true, 6: false, 7: false }));
    const [students, setStudents] = useState([]);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    useEffect(() => {
        fetchCourses();
        fetchTeachers();
        fetchSchools();
        fetchStudents();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.get('/courses');
            setCourses(data.courses || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des cours');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const { data } = await api.get('/users');
            setTeachers(data.filter(u => u.role === 'teacher'));
        } catch (err) {
            console.error('Erreur lors du chargement des professeurs:', err);
        }
    };

    const fetchSchools = async () => {
        try {
            const { data } = await api.get('/schools');
            setSchools(data.schools || []);
        } catch {
            setSchools([]);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/users');
            setStudents(data.filter(u => u.role === 'student'));
        } catch (err) {
            console.error('Erreur lors du chargement des élèves:', err);
        }
    };

    const openStudentModal = (course) => {
        setSelectedCourse(course);
        setSelectedStudentIds((course.students || []).map(s => s.id));
        setShowStudentModal(true);
    };

    const handleStudentSelectChange = (e) => {
        const options = e.target.options;
        const selected = Array.from(options).filter(o => o.selected).map(o => Number(o.value));
        setSelectedStudentIds(selected);
    };

    const handleSaveStudents = async () => {
        if (!selectedCourse) return;
        try {
            await api.put(`/courses/${selectedCourse.id}`, { student_ids: selectedStudentIds });
            setShowStudentModal(false);
            setSelectedCourse(null);
            setSelectedStudentIds([]);
            await fetchCourses();
        } catch (err) {
            alert('Erreur lors de la sauvegarde des élèves');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, options } = e.target;
        if (name === 'teacher_ids') {
            // Multi-select
            const selected = Array.from(options).filter(o => o.selected).map(o => Number(o.value));
            setFormData(prev => ({ ...prev, teacher_ids: selected }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (!formData.school_id) {
                setError('Veuillez sélectionner une école');
                return;
            }
            const submitData = {
                ...formData,
                school_id: parseInt(formData.school_id, 10),
                max_students: parseInt(formData.max_students, 10),
                teacher_ids: formData.teacher_ids,
                schedules: schedulesToPayload(formData.schedules || []),
            };

            if (editingId) {
                // Update
                await api.put(`/courses/${editingId}`, submitData);
                setEditingId(null);
            } else {
                // Create
                await api.post('/courses', submitData);
            }
            resetForm();
            await fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (course) => {
        const raw = course.schedules || [];
        setFormData({
            school_id: course.school_id || '',
            title: course.title,
            type: course.type,
            description: course.description || '',
            start_date: course.start_date || '',
            end_date: course.end_date || '',
            teacher_ids: (course.teachers || []).map(t => t.id),
            max_students: course.max_students || 30,
            is_active: course.is_active !== false,
            schedules: raw.length
                ? raw.map(s =>
                      newScheduleSlot({
                          weekday: s.weekday,
                          start_time: normalizeTimeInput(s.start_time),
                          end_time: normalizeTimeInput(s.end_time),
                      })
                  )
                : [],
        });
        setEditingId(course.id);
        setShowForm(true);
    };

    const addScheduleRow = () => {
        setFormData(prev => ({
            ...prev,
            schedules: [...(prev.schedules || []), newScheduleSlot()],
        }));
    };

    const removeScheduleRow = (key) => {
        setFormData(prev => ({
            ...prev,
            schedules: (prev.schedules || []).filter(s => s._key !== key),
        }));
    };

    const updateScheduleRow = (key, patch) => {
        setFormData(prev => ({
            ...prev,
            schedules: (prev.schedules || []).map(s => (s._key === key ? { ...s, ...patch } : s)),
        }));
    };

    const duplicateLastSchedule = () => {
        setFormData(prev => {
            const list = prev.schedules || [];
            if (!list.length) {
                return { ...prev, schedules: [newScheduleSlot()] };
            }
            const last = list[list.length - 1];
            return {
                ...prev,
                schedules: [
                    ...list,
                    newScheduleSlot({
                        weekday: last.weekday,
                        start_time: last.start_time,
                        end_time: last.end_time,
                    }),
                ],
            };
        });
    };

    const applySeriesToSelectedDays = () => {
        const start = normalizeTimeInput(seriesStart);
        const end = normalizeTimeInput(seriesEnd);
        if (!start || !end || start >= end) {
            setError('Série : indiquez une plage horaire valide (fin après début).');
            return;
        }
        const days = WEEKDAYS.map(d => d.value).filter(d => seriesDayMask[d]);
        if (!days.length) {
            setError('Cochez au moins un jour pour la série.');
            return;
        }
        setError('');
        setFormData(prev => ({
            ...prev,
            schedules: [
                ...(prev.schedules || []),
                ...days.map(d => newScheduleSlot({ weekday: d, start_time: start, end_time: end })),
            ],
        }));
    };

    const copyWeekdaySlotsToTargets = () => {
        const targets = WEEKDAYS.map(d => d.value).filter(d => copyToMask[d]);
        if (!targets.length) {
            setError('Cochez au moins un jour cible pour la copie.');
            return;
        }
        const list = formData.schedules || [];
        const sourceSlots = list.filter(s => Number(s.weekday) === Number(copyFromDay));
        if (!sourceSlots.length) {
            setError(`Aucun créneau sur ${WEEKDAYS.find(w => w.value === copyFromDay)?.full ?? copyFromDay}.`);
            return;
        }
        setError('');
        const additions = [];
        for (const t of targets) {
            if (Number(t) === Number(copyFromDay)) {
                continue;
            }
            for (const s of sourceSlots) {
                additions.push(
                    newScheduleSlot({
                        weekday: t,
                        start_time: s.start_time,
                        end_time: s.end_time,
                    })
                );
            }
        }
        setFormData(prev => ({ ...prev, schedules: [...(prev.schedules || []), ...additions] }));
    };

    const toggleSeriesDay = (d) => {
        setSeriesDayMask(prev => ({ ...prev, [d]: !prev[d] }));
    };

    const toggleCopyToDay = (d) => {
        setCopyToMask(prev => ({ ...prev, [d]: !prev[d] }));
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

        try {
            setError('');
            await api.delete(`/courses/${id}`);
            await fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setFormData({
            school_id: '',
            title: '',
            type: 'communication',
            description: '',
            start_date: '',
            end_date: '',
            teacher_ids: [],
            max_students: 30,
            is_active: true,
            schedules: [],
        });
        setShowForm(false);
        setEditingId(null);
    };

    if (loading) {
        return <div className="text-slate-500">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Cours</h1>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                school_id: schools[0]?.id ?? '',
                                title: '',
                                type: 'communication',
                                description: '',
                                start_date: '',
                                end_date: '',
                                teacher_ids: [],
                                max_students: 30,
                                is_active: true,
                                schedules: [],
                            });
                            setShowForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto"
                    >
                        ➕ Nouveau Cours
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* FORM */}
            {showForm && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {editingId ? 'Modifier le cours' : 'Créer un nouveau cours'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    École *
                                </label>
                                <select
                                    name="school_id"
                                    value={formData.school_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    <option value="">— Sélectionner —</option>
                                    {schools.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Titre *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Type *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    {COURSE_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Professeurs
                                </label>
                                <select
                                    name="teacher_ids"
                                    multiple
                                    value={formData.teacher_ids}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    size={Math.min(teachers.length, 6)}
                                >
                                    {teachers.map(teacher => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="text-xs text-slate-500 mt-1">Maintenez Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs professeurs.</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nombre max d'étudiants
                                </label>
                                <input
                                    type="number"
                                    name="max_students"
                                    value={formData.max_students}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="500"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Date de début
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Date de fin
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 space-y-4 bg-slate-50/80 dark:bg-slate-900/30">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                                    Horaire hebdomadaire
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={addScheduleRow}
                                        className="px-3 py-1.5 text-sm bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-800 dark:text-white rounded-lg transition"
                                    >
                                        + Créneau
                                    </button>
                                    <button
                                        type="button"
                                        onClick={duplicateLastSchedule}
                                        className="px-3 py-1.5 text-sm bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-800 dark:text-white rounded-lg transition"
                                    >
                                        Copier le dernier
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
                                <table className="w-full text-sm min-w-[520px]">
                                    <thead className="bg-slate-100 dark:bg-slate-700">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                                                Jour
                                            </th>
                                            <th className="px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                                                Début
                                            </th>
                                            <th className="px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                                                Fin
                                            </th>
                                            <th className="px-3 py-2 w-24" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                                        {(formData.schedules || []).length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                                                >
                                                    Aucun créneau — utilisez « Créneau » ou les raccourcis ci-dessous.
                                                </td>
                                            </tr>
                                        ) : (
                                            formData.schedules.map(row => (
                                                <tr key={row._key}>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.weekday}
                                                            onChange={e =>
                                                                updateScheduleRow(row._key, {
                                                                    weekday: Number(e.target.value),
                                                                })
                                                            }
                                                            className="w-full min-w-[8rem] px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                        >
                                                            {WEEKDAYS.map(d => (
                                                                <option key={d.value} value={d.value}>
                                                                    {d.full}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="time"
                                                            value={normalizeTimeInput(row.start_time)}
                                                            onChange={e =>
                                                                updateScheduleRow(row._key, {
                                                                    start_time: e.target.value,
                                                                })
                                                            }
                                                            className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="time"
                                                            value={normalizeTimeInput(row.end_time)}
                                                            onChange={e =>
                                                                updateScheduleRow(row._key, {
                                                                    end_time: e.target.value,
                                                                })
                                                            }
                                                            className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeScheduleRow(row._key)}
                                                            className="text-red-600 dark:text-red-400 hover:underline text-xs"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-3 space-y-2">
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                        Répéter (même horaire sur plusieurs jours)
                                    </p>
                                    <div className="flex flex-wrap gap-2 items-end">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-0.5">Début</label>
                                            <input
                                                type="time"
                                                value={seriesStart}
                                                onChange={e => setSeriesStart(e.target.value)}
                                                className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-0.5">Fin</label>
                                            <input
                                                type="time"
                                                value={seriesEnd}
                                                onChange={e => setSeriesEnd(e.target.value)}
                                                className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {WEEKDAYS.map(d => (
                                            <label
                                                key={d.value}
                                                className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={!!seriesDayMask[d.value]}
                                                    onChange={() => toggleSeriesDay(d.value)}
                                                    className="rounded border-slate-300"
                                                />
                                                {d.label}
                                            </label>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={applySeriesToSelectedDays}
                                        className="text-sm px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                                    >
                                        Ajouter la série
                                    </button>
                                </div>

                                <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-3 space-y-2">
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                        Copier un jour vers d’autres
                                    </p>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-0.5">Créneaux source</label>
                                        <select
                                            value={copyFromDay}
                                            onChange={e => setCopyFromDay(Number(e.target.value))}
                                            className="w-full max-w-xs px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        >
                                            {WEEKDAYS.map(d => (
                                                <option key={d.value} value={d.value}>
                                                    {d.full}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Jours cibles</p>
                                    <div className="flex flex-wrap gap-2">
                                        {WEEKDAYS.map(d => (
                                            <label
                                                key={d.value}
                                                className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={!!copyToMask[d.value]}
                                                    onChange={() => toggleCopyToDay(d.value)}
                                                    className="rounded border-slate-300"
                                                />
                                                {d.label}
                                            </label>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={copyWeekdaySlotsToTargets}
                                        className="text-sm px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
                                    >
                                        Copier vers les jours cochés
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Activer ce cours
                            </label>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition w-full sm:w-auto"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition w-full sm:w-auto"
                            >
                                {editingId ? 'Modifier' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABLE */}
            {courses.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-sm min-w-[1120px]">
                        <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">École</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Titre</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Type</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Professeur</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Élèves Max</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Dates</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 max-w-[200px]">Horaire</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Statut</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {courses.map(course => (
                                <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                                        {course.school?.name || '—'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-900 dark:text-white font-medium">{course.title}</td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                            course.type === 'communication'
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                        }`}>
                                            {COURSE_TYPES.find(t => t.value === course.type)?.label}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400">{Array.isArray(course.teachers) ? course.teachers.map(t => t.name).join(', ') : (course.teacher?.name || '—')}</td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400">{course.max_students || '—'}</td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                        {course.start_date && course.end_date ? `${course.start_date} → ${course.end_date}` : '—'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400 text-xs max-w-[200px] whitespace-normal">
                                        {formatScheduleSummary(course.schedules)}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                            course.is_active
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}>
                                            {course.is_active ? '✓ Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 space-x-2 whitespace-nowrap">
                                        <button
                                            onClick={() => handleEdit(course)}
                                            className="px-3 py-1 rounded font-medium transition outline-none text-blue-600 hover:text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
                                        >
                                            ✏️ Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="px-3 py-1 rounded font-medium transition outline-none text-red-600 hover:text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400"
                                        >
                                            🗑️ Supprimer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openStudentModal(course)}
                                            className="px-3 py-1 rounded font-medium transition outline-none text-indigo-600 hover:text-white hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400"
                                        >
                                            👥 Gérer élèves
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    Aucun cours trouvé
                </div>
            )}

            {showStudentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">
                            Assigner des élèves à : {selectedCourse?.title}
                        </h3>
                        <select
                            multiple
                            value={selectedStudentIds.map(String)}
                            onChange={handleStudentSelectChange}
                            className="w-full h-48 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-4"
                        >
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.name} ({student.email})
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowStudentModal(false)}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveStudents}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
