interface FeedWrapperProps {
  children: React.ReactNode;
}

export const FeedWrapper = ({ children }: FeedWrapperProps) => {
  return <div className="relative top-0 flex-1 pb-10">{children}</div>;
};
