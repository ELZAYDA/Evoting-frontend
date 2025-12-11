import { Injectable } from '@angular/core';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private ethereum: any;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.ethereum = window.ethereum;
    }
  }

  // التحقق من تثبيت MetaMask
  isMetaMaskInstalled(): boolean {
    return !!this.ethereum && this.ethereum.isMetaMask;
  }

  // الاتصال بالمحفظة
  async connectMetaMask(): Promise<string> {
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask غير مثبت. برجاء تثبيت MetaMask أولاً.');
      }

      // طلب الإذن للاتصال
      const accounts = await this.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('لم يتم العثور على حسابات في MetaMask');
      }
      
      return accounts[0];
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('تم رفض طلب الاتصال من قبل المستخدم');
      } else if (error.code === -32002) {
        throw new Error('يوجد طلب اتصال قيد الانتظار بالفعل');
      } else {
        throw new Error(`فشل الاتصال بالمحفظة: ${error.message}`);
      }
    }
  }

  // الحصول على الحساب المتصل حالياً
  async getConnectedAccount(): Promise<string | null> {
    try {
      if (!this.isMetaMaskInstalled()) {
        return null;
      }

      const accounts = await this.ethereum.request({
        method: 'eth_accounts'
      });
      
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  }

  // التحقق من الشبكة الصحيحة (1337 = Localhost)
  async checkNetwork(): Promise<boolean> {
    try {
      if (!this.isMetaMaskInstalled()) {
        return false;
      }

      const chainId = await this.ethereum.request({ method: 'eth_chainId' });
      return chainId === '0x539'; // 1337 بالتقدير السداسي عشري (Localhost)
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }

  // تغيير الشبكة إلى Localhost
  async switchToLocalhostNetwork(): Promise<boolean> {
    try {
      if (!this.isMetaMaskInstalled()) {
        return false;
      }

      await this.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }] // 1337
      });
      return true;
    } catch (error: any) {
      // إذا الشبكة غير موجودة، نضيفها
      if (error.code === 4902) {
        return await this.addLocalhostNetwork();
      }
      console.error('Error switching network:', error);
      return false;
    }
  }

  // إضافة شبكة Localhost إلى MetaMask
  private async addLocalhostNetwork(): Promise<boolean> {
    try {
      await this.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x539', // 1337
          chainName: 'Localhost 8545',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['http://127.0.0.1:8545']
        }]
      });
      return true;
    } catch (error) {
      console.error('Error adding network:', error);
      return false;
    }
  }

  // الحصول على توقيع من المحفظة
  async signMessage(message: string, account: string): Promise<string> {
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask غير مثبت');
      }

      const signature = await this.ethereum.request({
        method: 'personal_sign',
        params: [message, account]
      });

      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  // الاستماع لتغييرات الحساب
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (!this.isMetaMaskInstalled()) return;

    this.ethereum.on('accountsChanged', callback);
  }

  // الاستماع لتغييرات الشبكة
  onChainChanged(callback: (chainId: string) => void): void {
    if (!this.isMetaMaskInstalled()) return;

    this.ethereum.on('chainChanged', callback);
  }

  // إزالة مستمعات الأحداث
  removeAllListeners(): void {
    if (!this.isMetaMaskInstalled()) return;

    this.ethereum.removeAllListeners('accountsChanged');
    this.ethereum.removeAllListeners('chainChanged');
  }

  // تسجيل الخروج من المحفظة (في بعض الحالات)
  async disconnectWallet(): Promise<void> {
    try {
      if (!this.isMetaMaskInstalled()) return;

      // Note: MetaMask doesn't have a standard disconnect method
      // This just removes the listeners
      this.removeAllListeners();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }

  // التحقق مما إذا كان الحساب متصلاً وصالحاً
  async isAccountConnected(): Promise<boolean> {
    const account = await this.getConnectedAccount();
    return !!account;
  }

  // إرسال معاملة (للتوسع المستقبلي)
  async sendTransaction(transaction: any): Promise<string> {
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask غير مثبت');
      }

      const txHash = await this.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      });

      return txHash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  // الحصول على رصيد الحساب
  async getBalance(account: string): Promise<string> {
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask غير مثبت');
      }

      const balance = await this.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      });

      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  // تنسيق عنوان المحفظة (للعرض)
  formatAddress(address: string): string {
    if (!address) return '';
    
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // التحقق من صحة عنوان المحفظة
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // نسخ العنوان إلى الحافظة
  async copyToClipboard(address: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(address);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      throw error;
    }
  }
}