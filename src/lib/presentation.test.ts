import {describe,expect,it} from 'vitest';
import {formatPercent,formatEditableNumber} from './presentation';
describe('visible numeric formatting',()=>{
 it('hides floating-point artifacts in rate edit fields',()=>{
  expect(formatEditableNumber(.07*100)).toBe('7');
  expect(formatEditableNumber(.0653*100)).toBe('6.53');
 });
 it('shows each RAP band rate cleanly',()=>{
  for(let i=1;i<=10;i++)expect(formatPercent(i/100)).toBe(i+'%');
 });
});
