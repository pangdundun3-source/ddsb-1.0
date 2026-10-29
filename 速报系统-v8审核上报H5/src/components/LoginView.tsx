import React, { useState } from 'react';
import { RefreshCw, LayoutGrid } from 'lucide-react';
import { UserRole } from '../types';

interface LoginViewProps {
  onLoginSuccess: (account: string, role: UserRole) => void;
  onToast: (msg: string) => void;
  onBackToOfficialAccount?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onToast,
  onBackToOfficialAccount,
}) => {
  const [account, setAccount] = useState<string>('grid_zhangsan');
  const [captcha, setCaptcha] = useState<string>('582913');
  const [role, setRole] = useState<UserRole>('上报员');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateNewCaptcha = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCaptcha(code);
    onToast('新验证码已生成');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.trim()) {
      onToast('请输入登录账号');
      return;
    }
    if (!captcha.trim()) {
      onToast('请输入验证码');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onToast('登录校验成功');
      onLoginSuccess(account, role);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-slate-50 overflow-y-auto">
      <div className="space-y-4 my-auto">
        
        {/* Top App Card Header */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-base shrink-0 shadow-xs">
              V8
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">点点速豹 · 上报审核端</h2>
              <p className="text-xs text-slate-500">台中市网信办速报系统</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                登录账号
              </label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="请输入账号"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                验证码
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  placeholder="请输入 6 位数字验证码"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={generateNewCaptcha}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 flex items-center space-x-1 shrink-0 active:scale-95 transition-all"
                  title="刷新验证码"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" />
                  <span>刷新</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                登录身份
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['上报员', '审核员'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      role === r
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>正在校验鉴权...</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4" />
                  <span>登录校验</span>
                </>
              )}
            </button>

            {onBackToOfficialAccount && (
              <button
                type="button"
                onClick={onBackToOfficialAccount}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-all flex items-center justify-center space-x-1"
              >
                <span>← 返回“点点速豹”公众号主页</span>
              </button>
            )}
          </form>
        </div>

      </div>

      <p className="text-[10px] text-center text-slate-400 py-3 font-medium">
        台中市网信办 · 移动网格速报系统 V8.5
      </p>
    </div>
  );
};
