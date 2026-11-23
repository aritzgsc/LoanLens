import {describe,expect,it} from 'vitest';
import {scenarioIssue} from './scenario-guidance';
const make=(type:'unsubsidized'|'ffel'|'perkins'|'private'|'parent-plus'|'parent-consolidation',vintage:'old'|'new-ibr'|'unknown'='old')=>({loans:[{balance:30000,rate:.06,type}],vintage});
describe('borrower guidance without fabricated eligibility',()=>{
 it('separates missing balance, unknown history, supported Direct debt',()=>{
  expect(scenarioIssue({...make('unsubsidized'),loans:[{balance:0,rate:.06,type:'unsubsidized' as const}]})?.kind).toBe('balance');
  expect(scenarioIssue(make('unsubsidized','unknown'))?.kind).toBe('history');
  expect(scenarioIssue(make('unsubsidized','new-ibr'))).toBeNull();
 });
 it('distinguishes FFEL Stafford, Perkins, parent loans and private loans',()=>{
  for(const type of ['ffel','perkins','parent-plus','parent-consolidation','private'] as const) {
   expect(scenarioIssue(make(type))?.kind).toBe('loan-type');
  }
  expect(scenarioIssue(make('ffel'))?.detail).toMatch(/IBR/);
  expect(scenarioIssue(make('perkins'))?.detail).toMatch(/consolidation/i);
 });
 it('flags only unsupported loans in mixed portfolios',()=>{
  expect(scenarioIssue({loans:[{balance:20000,rate:.06,type:'unsubsidized' as const},{balance:10000,rate:.06,type:'ffel' as const}],vintage:'old'})?.detail).toMatch(/Loan 2:/);
 });
});
