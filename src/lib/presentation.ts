// Round values only for display; never alter the stored interest rate.
const percent = new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
const edit = new Intl.NumberFormat('en-US',{maximumFractionDigits:4});
export const formatPercent=(decimal:number)=>percent.format(decimal*100)+'%';
export const formatEditableNumber=(value:number)=>edit.format(value);
