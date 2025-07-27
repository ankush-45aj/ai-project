import { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [biometricsEnabled, setBiometricsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Using reducer for transfer state
    const [transferData, dispatchTransfer] = useReducer(transferReducer, {
        fromAccount: '',
        toAccount: '',
        amount: '',
        note: ''
    });

    const [accounts, setAccounts] = useState([
        { id: 1, name: 'Prime Savings', number: '****7890', balance: 125000, type: 'savings' },
        { id: 2, name: 'Global Advantage', number: '****4567', balance: 325000, type: 'current' },
        { id: 3, name: 'Future Investments', number: '****2345', balance: 750000, type: 'investment' }
    ]);

    const [transactions, setTransactions] = useState([
        { id: 1, account: 'Prime Savings', amount: 5000, type: 'credit', date: '2023-06-15', description: 'Salary Deposit', category: 'income' },
        { id: 2, account: 'Prime Savings', amount: -2500, type: 'debit', date: '2023-06-14', description: 'Grocery Store', category: 'shopping' },
        { id: 3, account: 'Global Advantage', amount: 12000, type: 'credit', date: '2023-06-12', description: 'Freelance Payment', category: 'income' },
        { id: 4, account: 'Global Advantage', amount: -7500, type: 'debit', date: '2023-06-10', description: 'Rent Payment', category: 'housing' }
    ]);

    const [transactionFilter, setTransactionFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        if (!currentUser) navigate('/login');
    }, [currentUser, navigate]);

    useEffect(() => {
        setResponse('');
    }, [activeTab]);

    // Show notification for 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

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
        } else {
            setResponse("I can help with:\n1. Account balances\n2. Fund transfers\n3. Loan info\n4. Transactions\n5. Bill payments\n6. Investments");
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

    const handleTransfer = async (e) => {
        e.preventDefault();
        const { fromAccount, toAccount, amount } = transferData;

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

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update accounts (in a real app, this would come from the API)
            setAccounts(accounts.map(acc =>
                acc.name === fromAccount
                    ? { ...acc, balance: acc.balance - amountNum }
                    : acc
            ));

            // Add to transactions
            const newTransaction = {
                id: transactions.length + 1,
                account: fromAccount,
                amount: -amountNum,
                type: 'debit',
                date: new Date().toISOString().split('T')[0],
                description: `Transfer to ${toAccount}`,
                category: 'transfer'
            };

            setTransactions([newTransaction, ...transactions]);

            showNotification(`Transfer of ₹${amount} initiated successfully!`, 'success');
            dispatchTransfer({ type: 'RESET' });
        } catch (error) {
            showNotification('Transfer failed. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        { icon: '💰', name: 'Send Money', action: () => setActiveTab('transfer') },
        { icon: '📊', name: 'Invest', action: () => setResponse("Invest 40% in Equity, 30% Debt, 20% Gold, 10% Crypto.") },
        { icon: '💳', name: 'Cards', action: () => setResponse("Your Platinum card (•••• 4567) has ₹87,500 available credit.") },
        { icon: '📱', name: 'Pay Bills', action: () => setActiveTab('payments') }
    ];

    const formattedCurrency = (val) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    return (
        <div className={`ai-dashboard ${darkMode ? 'dark-mode' : ''}`}>
            {/* Notification System */}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
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
                            ['invest', '📈', 'Invest'],
                            ['cards', '🛡️', 'Cards'],
                            ['settings', '⚙️', 'Settings']
                        ].map(([tab, icon, label]) => (
                            <li
                                key={tab}
                                className={activeTab === tab ? 'active' : ''}
                                onClick={() => setActiveTab(tab)}
                            >
                                <span className="nav-icon">{icon}</span> {label}
                            </li>
                        ))}
                    </ul>
                    <div className="theme-toggle">
                        <label className="switch">
                            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                            <span className="slider round"></span>
                        </label>
                        <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
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
                                                    <div className="transaction-date">{tx.date}</div>
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

                    {/* Transfer Tab */}
                    {activeTab === 'transfer' && (
                        <div className="transfer-section">
                            <h2>Fund Transfer</h2>
                            <form onSubmit={handleTransfer} className="transfer-form">
                                <div className="form-group">
                                    <label>From Account</label>
                                    <select
                                        value={transferData.fromAccount}
                                        onChange={(e) => dispatchTransfer({
                                            type: 'UPDATE_FIELD',
                                            field: 'fromAccount',
                                            value: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.map(account => (
                                            <option key={account.id} value={account.name}>
                                                {account.name} (••••{account.number.slice(-4)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>To Account/UPI</label>
                                    <input
                                        type="text"
                                        placeholder="Account Number or UPI ID"
                                        value={transferData.toAccount}
                                        onChange={(e) => dispatchTransfer({
                                            type: 'UPDATE_FIELD',
                                            field: 'toAccount',
                                            value: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Amount (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={transferData.amount}
                                        onChange={(e) => dispatchTransfer({
                                            type: 'UPDATE_FIELD',
                                            field: 'amount',
                                            value: e.target.value
                                        })}
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Note (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Add a note"
                                        value={transferData.note}
                                        onChange={(e) => dispatchTransfer({
                                            type: 'UPDATE_FIELD',
                                            field: 'note',
                                            value: e.target.value
                                        })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary transfer-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' :
                                        biometricsEnabled ? 'Authorize with Biometrics' : 'Confirm Transfer'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Accounts Tab */}
                    {activeTab === 'accounts' && (
                        <div className="accounts-management">
                            <h2>Account Management</h2>
                            <div className="account-cards-detailed">
                                {accounts.map(account => (
                                    <div key={account.id} className="account-card-detailed">
                                        <div className="account-card-header">
                                            <h3>{account.name}</h3>
                                            <span className="account-number">{account.number}</span>
                                        </div>
                                        <div className="account-card-body">
                                            <div className="account-balance-detailed">
                                                <span>Available Balance</span>
                                                <span>{formattedCurrency(account.balance)}</span>
                                            </div>
                                            <div className="account-actions">
                                                <button className="btn-secondary">View Statement</button>
                                                <button className="btn-secondary">Set Goals</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-primary">Open New Account</button>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div className="payments-section">
                            <h2>Bill Payments</h2>
                            <div className="biller-grid">
                                {[
                                    { name: 'Electricity', icon: '💡' },
                                    { name: 'Water', icon: '🚰' },
                                    { name: 'Gas', icon: '🔥' },
                                    { name: 'Internet', icon: '🌐' },
                                    { name: 'Mobile', icon: '📱' },
                                    { name: 'Credit Card', icon: '💳' }
                                ].map((biller, index) => (
                                    <div key={index} className="biller-card">
                                        <div className="biller-icon">{biller.icon}</div>
                                        <div className="biller-name">{biller.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Assistant */}
                    <div className="assistant-panel">
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
                </main>
            </div>
        </div>
    );
}

export default Dashboard;