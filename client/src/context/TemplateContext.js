import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchTemplates,
  createTemplate as apiCreateTemplate,
  updateTemplate as apiUpdateTemplate,
  fetchTemplateEntries,
  saveTemplateEntries
} from '../api/templates';
import { useAuth } from './AuthContext';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const DEFAULT_TIME_SLOTS = ['2:00', '3:30', '5:00', '6:30', '8:00', '9:30'];

const TemplateContext = createContext(null);

function parseTimeLabel(label) {
  const [hours, minutes] = label.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.MAX_SAFE_INTEGER;
  return hours * 60 + minutes;
}

function buildKey(dayIndex, timeLabel) {
  return `${dayIndex}-${timeLabel}`;
}

export function TemplateProvider({ children }) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [scheduleMap, setScheduleMap] = useState({});
  const [timeSlots, setTimeSlots] = useState([...DEFAULT_TIME_SLOTS]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const refreshTemplates = async () => {
    if (!user) {
      setTemplates([]);
      setSelectedTemplateId(null);
      setScheduleMap({});
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchTemplates();
      const fetchedTemplates = data.templates ?? [];
      setTemplates(fetchedTemplates);

      if (fetchedTemplates.length === 0) {
        setSelectedTemplateId(null);
        setScheduleMap({});
        return;
      }

      setSelectedTemplateId((current) => {
        if (current) {
          const stillExists = fetchedTemplates.some((template) => template.id === current);
          if (stillExists) {
            return current;
          }
        }
        return fetchedTemplates[0].id;
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTemplates();
  }, [user]);

  useEffect(() => {
    if (!selectedTemplateId || !user) {
      setScheduleMap({});
      return;
    }

    const loadEntries = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTemplateEntries(selectedTemplateId);
        const entries = data.entries ?? [];

        const newMap = {};
        const slots = new Set(DEFAULT_TIME_SLOTS);

        entries.forEach((entry) => {
          const key = buildKey(entry.dayOfWeek, entry.timeLabel);
          newMap[key] = entry.studentNames || '';
          slots.add(entry.timeLabel);
        });

        setScheduleMap(newMap);
        setTimeSlots(Array.from(slots).sort((a, b) => parseTimeLabel(a) - parseTimeLabel(b)));
      } catch (err) {
        console.error(err);
        setError(err.message);
        setScheduleMap({});
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [selectedTemplateId]);

  const setCell = (dayIndex, timeLabel, value) => {
    const key = buildKey(dayIndex, timeLabel);
    setScheduleMap((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const addTimeSlot = (label) => {
    if (!label) return;
    setTimeSlots((prev) => {
      if (prev.includes(label)) return prev;
      return [...prev, label].sort((a, b) => parseTimeLabel(a) - parseTimeLabel(b));
    });
  };

  const removeTimeSlot = (label) => {
    setTimeSlots((prev) => prev.filter((slot) => slot !== label));
    setScheduleMap((prev) => {
      const next = { ...prev };
      DAY_LABELS.forEach((_, dayIndex) => {
        const key = buildKey(dayIndex, label);
        delete next[key];
      });
      return next;
    });
  };

  const saveSchedule = async () => {
    if (!selectedTemplateId) return;

    setSaving(true);
    setError(null);
    try {
      const entries = [];
      timeSlots.forEach((timeLabel) => {
        DAY_LABELS.forEach((_, dayIndex) => {
          const key = buildKey(dayIndex, timeLabel);
          const studentNames = scheduleMap[key];
          if (studentNames && studentNames.trim()) {
            entries.push({
              dayOfWeek: dayIndex,
              timeLabel,
              teacherName: '',
              studentNames: studentNames.trim(),
              notes: ''
            });
          }
        });
      });

      await saveTemplateEntries(selectedTemplateId, entries);
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const createTemplate = async (name) => {
    const trimmed = name?.trim();
    if (!trimmed) {
      throw new Error('템플릿 이름을 입력해 주세요.');
    }

    const { template } = await apiCreateTemplate({ name: trimmed });
    setTemplates((prev) => [template, ...prev]);
    setSelectedTemplateId(template.id);
  };

  const renameTemplate = async (id, name) => {
    const trimmed = name?.trim();
    if (!trimmed) {
      throw new Error('템플릿 이름을 입력해 주세요.');
    }

    const { template } = await apiUpdateTemplate(id, { name: trimmed });
    setTemplates((prev) => prev.map((item) => (item.id === id ? template : item)));
  };

  const value = useMemo(() => ({
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    scheduleMap,
    timeSlots,
    loading,
    saving,
    error,
    addTimeSlot,
    removeTimeSlot,
    setCell,
    saveSchedule,
    createTemplate,
    renameTemplate,
    refreshTemplates,
    DAY_LABELS
  }), [
    templates,
    selectedTemplateId,
    scheduleMap,
    timeSlots,
    loading,
    saving,
    error
  ]);

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate 훅은 TemplateProvider 안에서만 사용할 수 있어요.');
  }
  return context;
}

export { DAY_LABELS };
