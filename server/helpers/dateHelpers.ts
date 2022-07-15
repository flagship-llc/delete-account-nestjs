export const formatDateWithSlashes = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};

export const getyyyyMMddHHmmssdate = (dateString?: string): string => {
  let date: Date;
  date = new Date();
  if (dateString) date = new Date(dateString);
  return `${date.getFullYear()}${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date
    .getHours()
    .toString()
    .padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date
    .getSeconds()
    .toString()
    .padStart(2, '0')}`;
};

export const getyyyyMMddDate = (dateString?: string): string => {
  let date: Date;
  date = new Date();
  if (dateString) date = new Date(dateString);
  return `${date.getFullYear()}${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
};

export const getFourDigitTime = () => {
  const date = new Date();
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

export const formatDateWithHyphens = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};
