import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleResetSettings = () => {
    try {
      localStorage.removeItem('wp_cover_config');
      localStorage.clear();
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-rose-500 selection:text-white"
        >
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-white">
                خطایی در اجرای برنامه رخ داده است
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                ممکن است داده‌های ذخیره‌شده یا تنظیمات قبلی دچار ناسازگاری شده باشند. با بازنشانی تنظیمات، برنامه به حالت پیش‌فرض برمی‌گردد.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-right overflow-x-auto">
                <p className="text-xs font-mono text-rose-300 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={this.handleResetSettings}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Trash2 className="w-4 h-4" />
                <span>بازنشانی تنظیمات و بارگذاری مجدد</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تلاش مجدد برای بارگذاری صفحه</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
