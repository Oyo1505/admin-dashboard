import { memo } from 'react';

const SkeletonBox = memo(({ className }: { className: string }) => (
  <div className={`${className} bg-gray-200 animate-shimmer`}></div>
));
SkeletonBox.displayName = 'SkeletonBox';
export default SkeletonBox;
