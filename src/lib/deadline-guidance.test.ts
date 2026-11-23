import {describe,expect,it} from 'vitest';
import {deadlineFromNotice,validCalendarDate} from './deadline-guidance';
describe('SAVE notice date estimates',()=>{
 it('rejects invalid calendar dates',()=>{
  expect(validCalendarDate('2026-02-30')).toBe(false);
  expect(deadlineFromNotice('bad',90,'2026-11-23')).toBeNull();
 });
 it('distinguishes overdue, upcoming and today',()=>{
  expect(deadlineFromNotice('2026-07-01',90,'2026-11-23')).toMatchObject({iso:'2026-09-29',state:'passed'});
  expect(deadlineFromNotice('2026-11-05',90,'2026-11-23')).toMatchObject({iso:'2027-02-03',state:'upcoming'});
  expect(deadlineFromNotice('2026-11-05',30,'2026-11-23')).toMatchObject({iso:'2026-12-05',state:'upcoming'});
  expect(deadlineFromNotice('2026-11-05',30,'2026-12-05')?.state).toBe('today');
 });
});
