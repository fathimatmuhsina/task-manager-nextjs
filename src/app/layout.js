import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'Task Flow',
  icons: {
    icon: 'https://taskflowpm.com/wp-content/uploads/2024/08/l9-1-e1724415548159.png'
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
