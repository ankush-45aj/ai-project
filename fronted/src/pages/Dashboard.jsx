import { useState, useEffect, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axiosInstance';

import './Dashboard.css';

// Reducer for transfer state
function transferReducer(state, action) {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        case 'RESET':
            return { fromAccount: '', toAccount: '', amount: '', note: '' };
        default:
            return state;
    }
}

// Reducer for settings state
function settingsReducer(state, action) {
    switch (action.type) {
        case 'UPDATE_SETTING':
            return { ...state, [action.field]: action.value };
        default:
            return state;
    }
}

function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const assistantRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [biometricsEnabled, setBiometricsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({
        x: isMobile ? window.innerWidth - 30 : window.innerWidth - 370,
        y: 100
    });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [aiVisible, setAiVisible] = useState(false);
    const [showCardDetails, setShowCardDetails] = useState({});
    const [paymentHistory, setPaymentHistory] = useState([]);

    // Using reducer for transfer state
    const [transferData, dispatchTransfer] = useReducer(transferReducer, {
        fromAccount: '',
        toAccount: '',
        amount: '',
        note: ''
    });

    // Using reducer for settings state
    const [settings, dispatchSettings] = useReducer(settingsReducer, {
        notifications: true,
        twoFactorAuth: false,
        language: 'en',
        currency: 'INR',
        statementFrequency: 'monthly'
    });

    const [accounts, setAccounts] = useState([
        { id: 1, name: 'Prime Savings', number: '****7890', balance: 125000, type: 'savings' },
        { id: 2, name: 'Global Advantage', number: '****4567', balance: 325000, type: 'current' },
        { id: 3, name: 'Future Investments', number: '****2345', balance: 750000, type: 'investment' }
    ]);

    const [cards, setCards] = useState([
        { id: 1, type: 'visa', number: '•••• •••• •••• 4567', name: 'Platinum Card', expiry: '12/25', cvv: '•••', limit: 150000, available: 87500, transactions: 12 },
        { id: 2, type: 'mastercard', number: '•••• •••• •••• 7890', name: 'Travel Card', expiry: '09/24', cvv: '•••', limit: 200000, available: 125000, transactions: 8 }
    ]);

    const [transactions, setTransactions] = useState([
        { id: 1, account: 'Prime Savings', amount: 5000, type: 'credit', date: '2023-06-15', description: 'Salary Deposit', category: 'income', status: 'completed' },
        { id: 2, account: 'Prime Savings', amount: -2500, type: 'debit', date: '2023-06-14', description: 'Grocery Store', category: 'shopping', status: 'completed' },
        { id: 3, account: 'Global Advantage', amount: 12000, type: 'credit', date: '2023-06-12', description: 'Freelance Payment', category: 'income', status: 'completed' },
        { id: 4, account: 'Global Advantage', amount: -7500, type: 'debit', date: '2023-06-10', description: 'Rent Payment', category: 'housing', status: 'completed' },
        { id: 5, account: 'Prime Savings', amount: -1500, type: 'debit', date: '2023-06-08', description: 'Electricity Bill', category: 'utilities', status: 'completed' },
        { id: 6, account: 'Future Investments', amount: -10000, type: 'debit', date: '2023-06-05', description: 'Mutual Fund Investment', category: 'investment', status: 'pending' }
    ]);

    const [bills, setBills] = useState([
        { id: 1, name: 'Electricity', dueDate: '2023-06-25', amount: 1850, paid: false, category: 'utilities' },
        { id: 2, name: 'Internet', dueDate: '2023-06-20', amount: 1200, paid: true, category: 'utilities' },
        { id: 3, name: 'Credit Card', dueDate: '2023-06-18', amount: 7500, paid: false, category: 'credit' },
        { id: 4, name: 'Mobile', dueDate: '2023-06-15', amount: 599, paid: true, category: 'communication' }
    ]);

    const [transactionFilter, setTransactionFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [cardFilter, setCardFilter] = useState('all');
    const [billFilter, setBillFilter] = useState('all');

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (!isMobile) {
                setAiVisible(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    // Check auth and scroll to top on tab change
    useEffect(() => {
        if (!currentUser) navigate('/login');
        window.scrollTo(0, 0);

        // Simulate fetching payment history
        const fetchPaymentHistory = async () => {
            try {
                // In a real app, this would be an API call
                const history = [
                    { id: 1, date: '2023-06-15', description: 'Salary Deposit', amount: 5000, status: 'completed' },
                    { id: 2, date: '2023-06-14', description: 'Grocery Store', amount: -2500, status: 'completed' },
                    { id: 3, date: '2023-06-12', description: 'Freelance Payment', amount: 12000, status: 'completed' },
                    { id: 4, date: '2023-06-10', description: 'Rent Payment', amount: -7500, status: 'completed' },
                    { id: 5, date: '2023-06-08', description: 'Electricity Bill', amount: -1500, status: 'completed' },
                    { id: 6, date: '2023-06-05', description: 'Mutual Fund Investment', amount: -10000, status: 'pending' }
                ];
                setPaymentHistory(history);
            } catch (error) {
                console.error('Error fetching payment history:', error);
            }
        };

        fetchPaymentHistory();
    }, [currentUser, navigate, activeTab]);

    // Show notification for 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Smooth scrolling for anchor links
    useEffect(() => {
        const handleClick = (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Handle draggable assistant
    useEffect(() => {
        const handleMove = (clientX, clientY) => {
            if (isDragging && !isMobile) {
                setPosition({
                    x: clientX - dragOffset.x,
                    y: clientY - dragOffset.y
                });
            }
        };

        const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
        const handleTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);

        const handleUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('mouseup', handleUp);
            window.addEventListener('touchend', handleUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchend', handleUp);
        };
    }, [isDragging, dragOffset, isMobile]);

    const startDrag = (e) => {
        if (isMobile) return;

        const isTouch = e.type === 'touchstart';
        const clientX = isTouch ? e.touches[0].clientX : e.clientX;
        const clientY = isTouch ? e.touches[0].clientY : e.clientY;

        if (e.target.className.includes('assistant-header')) {
            const rect = assistantRef.current.getBoundingClientRect();
            setDragOffset({
                x: clientX - rect.left,
                y: clientY - rect.top
            });
            setIsDragging(true);
        }
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
    };

    const handleAsk = () => {
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const lcQuery = query.toLowerCase();

        if (lcQuery.includes("balance")) {
            setResponse(`Your total balance is ₹${totalBalance.toLocaleString()}.\n${accounts.map(acc => `${acc.name}: ₹${acc.balance.toLocaleString()}`).join('\n')}`);
        } else if (lcQuery.includes("transfer")) {
            setResponse("Go to the 'Transfer' tab or tell me the amount and recipient.");
        } else if (lcQuery.includes("loan")) {
            setResponse("You're pre-approved for:\n- Personal Loan: ₹1,50,000 at 9.5%\n- Home Loan: ₹5,000,000 at 8.2%");
        } else if (lcQuery.includes("transaction")) {
            const filtered = filterTransactions(transactions, transactionFilter);
            const sorted = sortTransactions(filtered, sortOrder);
            setResponse(`Recent transactions:\n${sorted.slice(0, 3).map(t => `- ₹${Math.abs(t.amount)} ${t.type === 'credit' ? 'credited' : 'debited'} (${t.description})`).join('\n')}`);
        } else if (lcQuery.includes("hi") || lcQuery.includes("hello")) {
            setResponse("Hello! Ask about balances, transfers, loans, or transactions.");
        } else if (lcQuery.includes("pay bill")) {
            setResponse("You can pay bills in the Payments tab. I can help with:\n- Electricity\n- Water\n- Credit Card\n- Internet");
        } else if (lcQuery.includes("card")) {
            setResponse(`Your cards:\n${cards.map(c => `- ${c.name}: ${c.number} (₹${c.available.toLocaleString()} available)`).join('\n')}`);
        } else if (lcQuery.includes("settings")) {
            setResponse("Settings options:\n- Notifications: " + (settings.notifications ? "ON" : "OFF") +
                "\n- 2FA: " + (settings.twoFactorAuth ? "ON" : "OFF") +
                "\n- Language: " + settings.language);
        } else {
            setResponse("I can help with:\n1. Account balances\n2. Fund transfers\n3. Loan info\n4. Transactions\n5. Bill payments\n6. Investments\n7. Card details\n8. Settings");
        }
    };

    const filterTransactions = (transactions, filter) => {
        if (filter === 'all') return transactions;
        return transactions.filter(tx => tx.category === filter);
    };

    const sortTransactions = (transactions, order) => {
        return [...transactions].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return order === 'newest' ? dateB - dateA : dateA - dateB;
        });
    };

    const filterCards = (cards, filter) => {
        if (filter === 'all') return cards;
        return cards.filter(card => card.type === filter);
    };

    const filterBills = (bills, filter) => {
        if (filter === 'all') return bills;
        if (filter === 'paid') return bills.filter(bill => bill.paid);
        if (filter === 'unpaid') return bills.filter(bill => !bill.paid);
        return bills.filter(bill => bill.category === filter);
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        const { fromAccount, toAccount, amount, note } = transferData;

        if (!fromAccount || !toAccount || !amount) {
            showNotification('Please fill all required fields', 'error');
            return;
        }

        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            showNotification('Please enter a valid amount', 'error');
            return;
        }

        const fromAccountObj = accounts.find(acc => acc.name === fromAccount);
        if (fromAccountObj && amountNum > fromAccountObj.balance) {
            showNotification('Insufficient funds for this transfer', 'error');
            return;
        }

        setIsLoading(true);

        try {
            // In a real app, this would be an API call
            // const res = await axios.post('/transfer', {
            //     fromAccount,
            //     toAccount,
            //     amount: amountNum,
            //     note
            // });

            // Simulate API response delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update accounts
            setAccounts(prevAccounts =>
                prevAccounts.map(acc =>
                    acc.name === fromAccount
                        ? { ...acc, balance: acc.balance - amountNum }
                        : acc.name === toAccount
                            ? { ...acc, balance: acc.balance + amountNum }
                            : acc
                )
            );

            // Add to transactions
            const newTransaction = {
                id: transactions.length + 1,
                account: fromAccount,
                amount: -amountNum,
                type: 'debit',
                date: new Date().toISOString().split('T')[0],
                description: `Transfer to ${toAccount}`,
                category: 'transfer',
                status: 'completed'
            };

            setTransactions(prev => [newTransaction, ...prev]);

            // Add to payment history
            setPaymentHistory(prev => [
                {
                    id: paymentHistory.length + 1,
                    date: new Date().toISOString().split('T')[0],
                    description: `Transfer to ${toAccount}`,
                    amount: -amountNum,
                    status: 'completed'
                },
                ...prev
            ]);

            showNotification(`Transfer of ₹${amountNum} to ${toAccount} successful!`, 'success');
            dispatchTransfer({ type: 'RESET' });
        } catch (err) {
            showNotification(err.response?.data?.message || 'Transfer failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayBill = async (billId) => {
        setIsLoading(true);

        try {
            // In a real app, this would be an API call
            // const res = await axios.post('/pay-bill', { billId });

            // Simulate API response delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update bill status
            setBills(prevBills =>
                prevBills.map(bill =>
                    bill.id === billId ? { ...bill, paid: true } : bill
                )
            );

            // Find the bill
            const bill = bills.find(b => b.id === billId);
            if (bill) {
                // Update accounts (deduct from first account)
                setAccounts(prevAccounts =>
                    prevAccounts.map((acc, i) =>
                        i === 0 ? { ...acc, balance: acc.balance - bill.amount } : acc
                    )
                );

                // Add to transactions
                const newTransaction = {
                    id: transactions.length + 1,
                    account: accounts[0].name,
                    amount: -bill.amount,
                    type: 'debit',
                    date: new Date().toISOString().split('T')[0],
                    description: `Payment for ${bill.name}`,
                    category: bill.category,
                    status: 'completed'
                };

                setTransactions(prev => [newTransaction, ...prev]);

                // Add to payment history
                setPaymentHistory(prev => [
                    {
                        id: paymentHistory.length + 1,
                        date: new Date().toISOString().split('T')[0],
                        description: `Payment for ${bill.name}`,
                        amount: -bill.amount,
                        status: 'completed'
                    },
                    ...prev
                ]);

                showNotification(`Payment of ₹${bill.amount} for ${bill.name} successful!`, 'success');
            }
        } catch (err) {
            showNotification(err.response?.data?.message || 'Payment failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCardDetails = (cardId) => {
        setShowCardDetails(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const handleSettingChange = (field, value) => {
        dispatchSettings({ type: 'UPDATE_SETTING', field, value });
        showNotification(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated`, 'success');
    };

    const quickActions = [
        { icon: '💰', name: 'Send Money', action: () => setActiveTab('transfer') },
        { icon: '📊', name: 'Invest', action: () => setResponse("Invest 40% in Equity, 30% Debt, 20% Gold, 10% Crypto.") },
        { icon: '💳', name: 'Cards', action: () => setResponse("Your Platinum card (•••• 4567) has ₹87,500 available credit.") },
        { icon: '📱', name: 'Pay Bills', action: () => setActiveTab('payments') }
    ];

    const formattedCurrency = (val) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    const formatDate = (dateStr) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-IN', options);
    };

    const printPaymentHistory = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Payment History - ${currentUser?.name || 'User'}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .credit { color: green; }
                        .debit { color: red; }
                        .pending { color: orange; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                        .footer { margin-top: 30px; font-size: 0.8em; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <h1>Payment History</h1>
                            <p>Generated on: ${new Date().toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p><strong>User:</strong> ${currentUser?.name || 'User'}</p>
                            <p><strong>Account:</strong> ${accounts[0]?.name || ''} (${accounts[0]?.number || ''})</p>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${paymentHistory.map(payment => `
                                <tr>
                                    <td>${formatDate(payment.date)}</td>
                                    <td>${payment.description}</td>
                                    <td class="${payment.amount > 0 ? 'credit' : 'debit'}">
                                        ${formattedCurrency(payment.amount)}
                                    </td>
                                    <td class="${payment.status === 'pending' ? 'pending' : ''}">
                                        ${payment.status}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Ashutosh Bank - All rights reserved</p>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 1000);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className={`ai-dashboard ${darkMode ? 'dark-mode' : ''}`}>
            {/* Notification System */}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* Mobile AI Toggle Button */}
            {isMobile && (
                <button
                    className="mobile-ai-toggle"
                    onClick={() => setAiVisible(!aiVisible)}
                >
                    {aiVisible ? '✕' : '🤖'}
                </button>
            )}

            {/* HEADER */}
            <header className="dashboard-header">
                <div className="header-left">
                    <h1 className="neon-text">ASHUTOSH BANK</h1>
                    <div className="ai-status"><span className="pulse-dot"></span>AI Assistant Active</div>
                </div>
                <div className="user-info">
                    <div className="user-avatar">{currentUser?.name?.[0]?.toUpperCase() || 'U'}</div>
                    <div className="user-details">
                        <span className="user-name">{currentUser?.name || 'User'}</span>
                        <span className="user-email">{currentUser?.email}</span>
                    </div>
                    <button className="logout-btn" onClick={logout}><span className="icon-logout"></span></button>
                </div>
            </header>

            {/* MAIN CONTAINER */}
            <div className="dashboard-container">
                {/* SIDEBAR */}
                <nav className="dashboard-nav">
                    <ul>
                        {[
                            ['dashboard', '⌂', 'Dashboard'],
                            ['accounts', '💳', 'Accounts'],
                            ['transfer', '⇄', 'Transfer'],
                            ['payments', '📱', 'Payments'],
                            ['cards', '🛡️', 'Cards'],
                            ['history', '📜', 'History'],
                            ['settings', '⚙️', 'Settings']
                        ].map(([tab, icon, label]) => (
                            <li
                                key={tab}
                                className={activeTab === tab ? 'active' : ''}
                                onClick={() => setActiveTab(tab)}
                            >
                                <span className="nav-icon">{icon}</span>
                                {!isMobile && label}
                            </li>
                        ))}
                    </ul>
                    {!isMobile && (
                        <div className="theme-toggle">
                            <label className="switch">
                                <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                                <span className="slider round"></span>
                            </label>
                            <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                        </div>
                    )}
                </nav>

                {/* MAIN CONTENT */}
                <main className="dashboard-content">
                    {/* Dashboard Overview */}
                    {activeTab === 'dashboard' && (
                        <div className="dashboard-overview">
                            <div className="balance-summary">
                                <h2>Total Wealth</h2>
                                <div className="total-balance">{formattedCurrency(accounts.reduce((sum, a) => sum + a.balance, 0))}</div>
                                <span className="trend-up">↑ 12% from last month</span>
                            </div>

                            <div className="quick-actions">
                                <h3>Quick Actions</h3>
                                <div className="action-grid">
                                    {quickActions.map((action, i) => (
                                        <button key={i} className="action-card" onClick={action.action}>
                                            <span className="action-icon">{action.icon}</span>
                                            <span>{action.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="accounts-preview">
                                <h3>Your Accounts</h3>
                                <div className="account-cards">
                                    {accounts.map(acc => (
                                        <div key={acc.id} className="account-card">
                                            <div className="account-header">
                                                <span className="account-type">{acc.type.toUpperCase()}</span>
                                                <span className="account-number">{acc.number}</span>
                                            </div>
                                            <div className="account-name">{acc.name}</div>
                                            <div className="account-balance">{formattedCurrency(acc.balance)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="recent-transactions">
                                <div className="transactions-header">
                                    <h3>Recent Activity</h3>
                                    <div className="transaction-filters">
                                        <select
                                            value={transactionFilter}
                                            onChange={(e) => setTransactionFilter(e.target.value)}
                                        >
                                            <option value="all">All Transactions</option>
                                            <option value="income">Income</option>
                                            <option value="shopping">Shopping</option>
                                            <option value="housing">Housing</option>
                                            <option value="transfer">Transfers</option>
                                            <option value="utilities">Utilities</option>
                                        </select>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="transactions-list">
                                    {sortTransactions(filterTransactions(transactions, transactionFilter), sortOrder)
                                        .slice(0, 4)
                                        .map(tx => (
                                            <div key={tx.id} className="transaction-item">
                                                <div className="transaction-icon">{tx.type === 'credit' ? '⬇️' : '⬆️'}</div>
                                                <div className="transaction-details">
                                                    <div className="transaction-description">{tx.description}</div>
                                                    <div className="transaction-date">{formatDate(tx.date)}</div>
                                                </div>
                                                <div className={`transaction-amount ${tx.type}`}>
                                                    {tx.type === 'credit' ? '+' : '-'}{formattedCurrency(Math.abs(tx.amount))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Accounts Tab */}
                    {activeTab === 'accounts' && (
                        <div className="accounts-tab">
                            <h2>Your Accounts</h2>
                            <div className="account-cards-detailed">
                                {accounts.map(account => (
                                    <div key={account.id} className="account-card-detailed">
                                        <div className="account-card-header">
                                            <span className="account-type-badge">{account.type.toUpperCase()}</span>
                                            <span className="account-number">{account.number}</span>
                                        </div>
                                        <div className="account-card-body">
                                            <h3>{account.name}</h3>
                                            <div className="account-balance-detailed">
                                                {formattedCurrency(account.balance)}
                                            </div>
                                            <div className="account-actions">
                                                <button className="btn-small">View Statement</button>
                                                <button className="btn-small">Details</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Transfer Tab */}
                    {activeTab === 'transfer' && (
                        <div className="transfer-tab">
                            <h2>Transfer Funds</h2>
                            <form className="transfer-form" onSubmit={handleTransfer}>
                                <div className="form-group">
                                    <label htmlFor="fromAccount">From Account</label>
                                    <select
                                        id="fromAccount"
                                        value={transferData.fromAccount}
                                        onChange={(e) => dispatchTransfer({ type: 'UPDATE_FIELD', field: 'fromAccount', value: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.name}>{acc.name} ({formattedCurrency(acc.balance)})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="toAccount">To Account</label>
                                    <select
                                        id="toAccount"
                                        value={transferData.toAccount}
                                        onChange={(e) => dispatchTransfer({ type: 'UPDATE_FIELD', field: 'toAccount', value: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.filter(acc => acc.name !== transferData.fromAccount).map(acc => (
                                            <option key={acc.id} value={acc.name}>{acc.name} ({acc.number})</option>
                                        ))}
                                        <option value="External">External Bank Account</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="amount">Amount</label>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={transferData.amount}
                                        onChange={(e) => dispatchTransfer({ type: 'UPDATE_FIELD', field: 'amount', value: e.target.value })}
                                        placeholder="Enter amount"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="note">Note (Optional)</label>
                                    <textarea
                                        id="note"
                                        value={transferData.note}
                                        onChange={(e) => dispatchTransfer({ type: 'UPDATE_FIELD', field: 'note', value: e.target.value })}
                                        placeholder="Add a note for this transfer"
                                        rows="3"
                                    />
                                </div>

                                <button type="submit" className="btn-primary" disabled={isLoading}>
                                    {isLoading ? 'Processing...' : 'Transfer Now'}
                                </button>
                            </form>

                            <div className="recent-transfers">
                                <h3>Recent Transfers</h3>
                                <div className="transfers-list">
                                    {transactions
                                        .filter(tx => tx.category === 'transfer')
                                        .slice(0, 3)
                                        .map(tx => (
                                            <div key={tx.id} className="transfer-item">
                                                <div className="transfer-icon">⇄</div>
                                                <div className="transfer-details">
                                                    <div className="transfer-description">{tx.description}</div>
                                                    <div className="transfer-date">{formatDate(tx.date)}</div>
                                                </div>
                                                <div className={`transfer-amount ${tx.type}`}>
                                                    {formattedCurrency(Math.abs(tx.amount))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div className="payments-tab">
                            <h2>Bill Payments</h2>

                            <div className="bills-overview">
                                <div className="bills-summary">
                                    <div className="summary-card">
                                        <h4>Pending Bills</h4>
                                        <p>{bills.filter(b => !b.paid).length}</p>
                                    </div>
                                    <div className="summary-card">
                                        <h4>Total Due</h4>
                                        <p>{formattedCurrency(bills.filter(b => !b.paid).reduce((sum, b) => sum + b.amount, 0))}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bills-filters">
                                <select
                                    value={billFilter}
                                    onChange={(e) => setBillFilter(e.target.value)}
                                >
                                    <option value="all">All Bills</option>
                                    <option value="paid">Paid</option>
                                    <option value="unpaid">Unpaid</option>
                                    <option value="utilities">Utilities</option>
                                    <option value="credit">Credit</option>
                                </select>
                            </div>

                            <div className="biller-grid">
                                {filterBills(bills, billFilter).map(bill => (
                                    <div key={bill.id} className="biller-card">
                                        <div className="biller-header">
                                            <span className="biller-name">{bill.name}</span>
                                            <span className={`biller-status ${bill.paid ? 'paid' : 'unpaid'}`}>
                                                {bill.paid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </div>
                                        <div className="biller-details">
                                            <div className="biller-amount">
                                                {formattedCurrency(bill.amount)}
                                            </div>
                                            <div className="biller-due">
                                                Due: {formatDate(bill.dueDate)}
                                            </div>
                                        </div>
                                        {!bill.paid && (
                                            <button
                                                className="btn-pay"
                                                onClick={() => handlePayBill(bill.id)}
                                                disabled={isLoading}
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cards Tab */}
                    {activeTab === 'cards' && (
                        <div className="cards-tab">
                            <h2>Your Cards</h2>

                            <div className="cards-filters">
                                <select
                                    value={cardFilter}
                                    onChange={(e) => setCardFilter(e.target.value)}
                                >
                                    <option value="all">All Cards</option>
                                    <option value="visa">Visa</option>
                                    <option value="mastercard">Mastercard</option>
                                </select>
                            </div>

                            <div className="cards-grid">
                                {filterCards(cards, cardFilter).map(card => (
                                    <div key={card.id} className={`card-item ${card.type}`}>
                                        <div className="card-header">
                                            <span className="card-type">{card.type.toUpperCase()}</span>
                                            <span className="card-name">{card.name}</span>
                                        </div>
                                        <div className="card-number">{card.number}</div>
                                        <div className="card-details">
                                            <div>
                                                <span className="detail-label">Expiry</span>
                                                <span className="detail-value">{card.expiry}</span>
                                            </div>
                                            <div>
                                                <span className="detail-label">CVV</span>
                                                <span className="detail-value">
                                                    {showCardDetails[card.id] ? card.cvv : '•••'}
                                                    <button
                                                        className="btn-show-cvv"
                                                        onClick={() => toggleCardDetails(card.id)}
                                                    >
                                                        {showCardDetails[card.id] ? 'Hide' : 'Show'}
                                                    </button>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-limits">
                                            <div>
                                                <span className="limit-label">Limit</span>
                                                <span className="limit-value">{formattedCurrency(card.limit)}</span>
                                            </div>
                                            <div>
                                                <span className="limit-label">Available</span>
                                                <span className="limit-value">{formattedCurrency(card.available)}</span>
                                            </div>
                                        </div>
                                        <div className="card-actions">
                                            <button className="btn-small">View Transactions</button>
                                            <button className="btn-small">Freeze Card</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payment History Tab */}
                    {activeTab === 'history' && (
                        <div className="history-tab">
                            <div className="history-header">
                                <h2>Payment History</h2>
                                <button className="btn-print" onClick={printPaymentHistory}>
                                    Print Statement
                                </button>
                            </div>

                            <div className="history-filters">
                                <select
                                    value={transactionFilter}
                                    onChange={(e) => setTransactionFilter(e.target.value)}
                                >
                                    <option value="all">All Transactions</option>
                                    <option value="income">Income</option>
                                    <option value="shopping">Shopping</option>
                                    <option value="housing">Housing</option>
                                    <option value="transfer">Transfers</option>
                                    <option value="utilities">Utilities</option>
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>

                            <div className="history-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Account</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortTransactions(filterTransactions(transactions, transactionFilter), sortOrder).map(tx => (
                                            <tr key={tx.id}>
                                                <td>{formatDate(tx.date)}</td>
                                                <td>{tx.description}</td>
                                                <td>{tx.account}</td>
                                                <td className={tx.type === 'credit' ? 'credit' : 'debit'}>
                                                    {tx.type === 'credit' ? '+' : '-'}{formattedCurrency(Math.abs(tx.amount))}
                                                </td>
                                                <td className={`status-${tx.status}`}>
                                                    {tx.status}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="settings-tab">
                            <h2>Settings</h2>

                            <div className="settings-section">
                                <h3>Account Settings</h3>
                                <div className="setting-item">
                                    <label>Notifications</label>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications}
                                            onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label>Two-Factor Authentication</label>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.twoFactorAuth}
                                            onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label>Biometric Login</label>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={biometricsEnabled}
                                            onChange={(e) => setBiometricsEnabled(e.target.checked)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3>Preferences</h3>
                                <div className="setting-item">
                                    <label>Language</label>
                                    <select
                                        value={settings.language}
                                        onChange={(e) => handleSettingChange('language', e.target.value)}
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">Hindi</option>
                                        <option value="mr">Marathi</option>
                                        <option value="ta">Tamil</option>
                                    </select>
                                </div>
                                <div className="setting-item">
                                    <label>Currency</label>
                                    <select
                                        value={settings.currency}
                                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                                    >
                                        <option value="INR">Indian Rupee (₹)</option>
                                        <option value="USD">US Dollar ($)</option>
                                        <option value="EUR">Euro (€)</option>
                                        <option value="GBP">British Pound (£)</option>
                                    </select>
                                </div>
                                <div className="setting-item">
                                    <label>Statement Frequency</label>
                                    <select
                                        value={settings.statementFrequency}
                                        onChange={(e) => handleSettingChange('statementFrequency', e.target.value)}
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3>Theme</h3>
                                <div className="theme-options">
                                    <div
                                        className={`theme-option ${!darkMode ? 'active' : ''}`}
                                        onClick={() => setDarkMode(false)}
                                    >
                                        <div className="theme-preview light"></div>
                                        <span>Light</span>
                                    </div>
                                    <div
                                        className={`theme-option ${darkMode ? 'active' : ''}`}
                                        onClick={() => setDarkMode(true)}
                                    >
                                        <div className="theme-preview dark"></div>
                                        <span>Dark</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* AI Assistant Panel */}
            <div
                className="assistant-panel"
                ref={assistantRef}
                style={{
                    position: isMobile ? 'fixed' : 'fixed',
                    display: isMobile ? (aiVisible ? 'block' : 'none') : 'block',
                    left: isMobile ? 0 : `${position.x}px`,
                    right: isMobile ? 0 : 'auto',
                    top: isMobile ? 'auto' : `${position.y}px`,
                    bottom: isMobile ? 0 : 'auto',
                    width: isMobile ? '100%' : '350px',
                    height: isMobile ? '60vh' : '400px',
                    borderRadius: isMobile ? '20px 20px 0 0' : '16px',
                    transform: isMobile ? (aiVisible ? 'translateY(0)' : 'translateY(100%)') : 'none',
                    cursor: isDragging ? 'grabbing' : 'pointer'
                }}
                onMouseDown={startDrag}
                onTouchStart={startDrag}
            >
                <div className="assistant-header">
                    <h3>🤖 NEO Assistant</h3>
                    <div className="assistant-status"><span className="pulse-dot"></span>Online</div>
                </div>

                <div className="assistant-chat">
                    {response && (
                        <div className="assistant-message">
                            <div className="message-avatar">AI</div>
                            <div className="message-content">
                                {response.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                            </div>
                        </div>
                    )}

                    <div className="assistant-input">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask NEO anything..."
                            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                        />
                        <button onClick={handleAsk} className="ask-btn"><span className="icon-send"></span></button>
                    </div>

                    <div className="quick-prompts">
                        <button onClick={() => { setQuery("What's my balance?"); handleAsk(); }}>Balance</button>
                        <button onClick={() => { setQuery("Show recent transactions"); handleAsk(); }}>Transactions</button>
                        <button onClick={() => { setQuery("Loan options"); handleAsk(); }}>Loans</button>
                        <button onClick={() => setActiveTab('transfer')}>Transfer Funds</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;