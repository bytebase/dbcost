// Use a customized Cell component to avoid table's unnecessary on hover re-renders.
const TdCell = (props: any) => {
  // Ant Design tables listen to onMouseEnter and onMouseLeave events to implement row hover styles (with rowSpan).
  // But reacting to too many onMouseEnter and onMouseLeave events will cause performance issues.
  // We can sacrifice a bit of style on hover as a compromise for better performance.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onMouseEnter, onMouseLeave, ...restProps } = props;
  return <td {...restProps} />;
};

export default TdCell;
