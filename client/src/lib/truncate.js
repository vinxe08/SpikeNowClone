// For shorten and add ellipsis at the last part of the paragraph
export const truncate = (paragraph, maxLength) => {
  if (paragraph?.length <= maxLength) {
    return paragraph;
  }
  return paragraph?.slice(0, maxLength) + "...";
};
