"use client";

export default function AutoSubmitSelect(props) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
