/**
 * 资源排班域 — Resource / Calendar
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { Resource } from '@/types/ontology/ap/resource/resource';
import type { Calendar } from '@/types/ontology/ap/resource/calendar';
import type { CalendarAttendance } from '@/types/ontology/ap/resource/calendar_attendance';
import type { CalendarLeave } from '@/types/ontology/ap/resource/calendar_leave';

export const resourceService = buildEntityApi<Resource>(OT.Resource);
export const calendarService = buildEntityApi<Calendar>(OT.Calendar);
export const calendarAttendanceService = buildEntityApi<CalendarAttendance>(OT.CalendarAttendance);
export const calendarLeaveService = buildEntityApi<CalendarLeave>(OT.CalendarLeave);
