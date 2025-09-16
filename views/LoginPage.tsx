import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, KeyRound, Users, University, Hospital, Lock, User as UserIcon, Mail, Phone, Building } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Checkbox from '../components/ui/Checkbox';
import { useToast } from '../hooks/useToast';
import { User, UserRole, UserStatus } from '../types';

interface LoginPageProps {
  onAttemptLogin: (credentials: { username: string; password?: string; role: UserRole }) => User | null;
  onAdminRegister: (user: User) => boolean;
}

const Feature: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <motion.li
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-center space-x-3"
  >
    <div className="bg-indigo-500/20 p-2 rounded-full">{icon}</div>
    <span className="text-gray-300">{text}</span>
  </motion.li>
);

const LoginPage: React.FC<LoginPageProps> = ({ onAttemptLogin, onAdminRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.LEVEL1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');

  const { addToast } = useToast();

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
        addToast('Please enter a username and password.', 'error');
        return;
    }
    setIsLoading(true);

    setTimeout(() => {
      const loggedInUser = onAttemptLogin({ username, password, role: selectedRole });
      setIsLoading(false);
      if (loggedInUser) {
        addToast(`Logged in as ${loggedInUser.username} (${loggedInUser.role})!`, 'success');
      } else {
        addToast('Login failed. Invalid credentials or role.', 'error');
      }
    }, 1000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
        const loggedInUser = onAttemptLogin({ username, password, role: UserRole.ADMIN });
        setIsLoading(false);
        if (loggedInUser) {
            addToast(`Admin login successful! Welcome back.`, 'success');
        } else {
            addToast('Invalid admin credentials.', 'error');
        }
    }, 1000);
  };
  
  const handleAdminSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Add validation here
    if (!firstName || !lastName || !email || !orgName || !username || !password) {
        addToast('Please fill all required fields.', 'error');
        setIsLoading(false);
        return;
    }
    
    const newAdminUser: User = {
        id: `admin-${Date.now()}`,
        username,
        password,
        role: UserRole.ADMIN,
        roleName: 'Administrator',
        status: UserStatus.ACTIVE,
        organization: orgName,
    };

    setTimeout(() => {
        const success = onAdminRegister(newAdminUser);
        setIsLoading(false);
        if (success) {
            addToast(`Admin account for ${username} created! Please login.`, 'success');
            setIsLoginView(true); // switch to login view
            // Clear form
            setUsername('');
            setPassword('');
            setFirstName('');
            setLastName('');
            setPhone('');
            setEmail('');
            setOrgName('');
        } else {
            addToast('Username is already taken, please try another.', 'error');
        }
    }, 1500);
  };
  
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Description */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-5xl font-extrabold text-white">
            Welcome to <span className="text-indigo-400">SmartCrypt</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">Secure File Sharing for Hospitals & Educational Institutions</p>
          <ul className="mt-8 space-y-4">
            <Feature icon={<ShieldCheck className="text-indigo-400"/>} text="Secure file sharing with end-to-end encryption" />
            <Feature icon={<KeyRound className="text-indigo-400"/>} text="Role-based access control (RBAC)" />
            <Feature icon={<Users className="text-indigo-400"/>} text="AES + RSA + ABE encryption standards" />
            <Feature icon={<University className="text-indigo-400"/>} text="Organization-based access for Colleges/Universities" />
            <Feature icon={<Hospital className="text-indigo-400"/>} text="Secure data handling for Hospitals" />
          </ul>
        </motion.div>
        
        {/* Right Side: Login Card */}
        <Card className="w-full max-w-md justify-self-center lg:justify-self-end">
            <Checkbox id="admin-toggle" label="🔐 Are you an Admin?" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            <div className="mt-6">
                <AnimatePresence mode="wait">
                    { isAdmin ? (
                        <motion.div key="admin" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                             <h2 className="text-2xl font-bold text-center text-white mb-4">{isLoginView ? 'Admin Login' : 'Admin Registration'}</h2>
                             <AnimatePresence mode="wait">
                                {isLoginView ? (
                                    <motion.form key="admin-login" onSubmit={handleAdminLogin} className="space-y-6" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                        <Input id="admin-username" label="Username" placeholder="Enter admin username" icon={<UserIcon className="h-4 w-4 text-gray-400"/>} onChange={e => setUsername(e.target.value)} required/>
                                        <Input id="admin-password" label="Password" type="password" placeholder="••••••••" icon={<Lock className="h-4 w-4 text-gray-400"/>} onChange={e => setPassword(e.target.value)} required/>
                                        <Button type="submit" isLoading={isLoading}>Login</Button>
                                    </motion.form>
                                ) : (
                                    <motion.form key="admin-signup" onSubmit={handleAdminSignup} className="space-y-4" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input id="firstName" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required/>
                                            <Input id="lastName" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required/>
                                        </div>
                                        <Input id="phone" type="tel" placeholder="Phone Number" icon={<Phone className="h-4 w-4 text-gray-400"/>} value={phone} onChange={e => setPhone(e.target.value)}/>
                                        <Input id="email" type="email" placeholder="Email Address" icon={<Mail className="h-4 w-4 text-gray-400"/>} value={email} onChange={e => setEmail(e.target.value)} required/>
                                        <Input id="orgName" placeholder="Organization Name" icon={<Building className="h-4 w-4 text-gray-400"/>} value={orgName} onChange={e => setOrgName(e.target.value)} required/>
                                        <hr className="border-gray-600"/>
                                        <Input id="signup-username" placeholder="Set Username" icon={<UserIcon className="h-4 w-4 text-gray-400"/>} value={username} onChange={e => setUsername(e.target.value)} required/>
                                        <Input id="signup-password" type="password" placeholder="Set Password" icon={<Lock className="h-4 w-4 text-gray-400"/>} value={password} onChange={e => setPassword(e.target.value)} required/>
                                        <Button type="submit" isLoading={isLoading}>Register</Button>
                                    </motion.form>
                                )}
                             </AnimatePresence>
                             <p className="text-center text-sm text-gray-400 mt-6">
                                {isLoginView ? "Don't have an admin account?" : "Already have an account?"}{' '}
                                <button onClick={() => setIsLoginView(!isLoginView)} className="font-semibold text-indigo-400 hover:text-indigo-300">
                                    {isLoginView ? 'Sign Up' : 'Login'}
                                </button>
                             </p>
                        </motion.div>
                    ) : (
                        <motion.div key="user" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                            <h2 className="text-2xl font-bold text-center text-white mb-4">User Login</h2>
                            <form onSubmit={handleUserLogin} className="space-y-6">
                                <Input id="user-username" label="Username" placeholder="Enter your username" icon={<UserIcon className="h-4 w-4 text-gray-400"/>} onChange={e => setUsername(e.target.value)} required/>
                                <Input id="user-password" label="Password" type="password" placeholder="••••••••" icon={<Lock className="h-4 w-4 text-gray-400"/>} onChange={e => setPassword(e.target.value)} required/>
                                <div>
                                    <label htmlFor="role-select" className="block text-sm font-medium text-gray-300 mb-1">Select Role</label>
                                    <select
                                    id="role-select"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                                    className="w-full rounded-md border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                                    >
                                    {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                    </select>
                                </div>
                                <Button type="submit" isLoading={isLoading}>Login</Button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;