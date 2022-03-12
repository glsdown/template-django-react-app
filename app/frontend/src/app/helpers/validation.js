export const validEmail =
  /^[a-zA-Z0-9\._:$!%-']+@[a-zA-Z0-9\.-]*(?:mydomain|seconddomain)\.[a-zA-Z\\.]{2,5}$/; // eslint-disable-line
export const validEmailHelp = 'Email must be in the form xxx@xxx.xxx';
export const validPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,100}$/;
export const validPasswordHelp =
  'Your password must contain at least 1 number, 1 lowercase and 1 uppercase number, and be 8 or more characters.';

// Title options
export const titleOptions = [
  { value: '', label: '---' },
  { value: 'Mx', label: 'Mx' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Mr', label: 'Mr' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Prof', label: 'Prof' },
  { value: 'Other', label: 'Other' },
];
