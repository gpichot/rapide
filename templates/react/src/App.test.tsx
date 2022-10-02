import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";

describe("App", () => {
  it("renders App component", () => {
    render(<App />);

    expect(screen.getByText(/Rapide/)).toBeInTheDocument();
  });

  it('increments the count when the "count is" button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const countButton = screen.getByText(/count is/i);

    expect(countButton).toHaveTextContent("count is 0");

    await user.click(countButton);

    expect(countButton).toHaveTextContent("count is 1");
  });
});
