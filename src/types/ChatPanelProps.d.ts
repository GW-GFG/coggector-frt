type ChatPanelProps = {
  accessToken: string | null;
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  selectedItem: Item | null;
}