'use client';

import { useState, useEffect } from 'react';

interface Appointment {
  appointmentId: string;
  status: string;
  appointmentDate: string;
  appointmentTime: string;
  service: string;
  duration: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests: string;
  bookingSubmittedAt: string;
}

export default function BookingDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'pending'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real app, this would come from your API/database
  useEffect(() => {
    // Simulate loading appointments
    const mockAppointments: Appointment[] = [
      {
        appointmentId: 'APT-123456',
        status: 'PENDING',
        appointmentDate: 'Monday, January 15, 2024',
        appointmentTime: '10:00 AM',
        service: 'Manicure and Shellac',
        duration: '1 hour',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah@example.com',
        customerPhone: '(555) 123-4567',
        specialRequests: 'Prefer light pink color',
        bookingSubmittedAt: '2024-01-10 2:30 PM'
      },
      {
        appointmentId: 'APT-789012',
        status: 'CONFIRMED',
        appointmentDate: 'Tuesday, January 16, 2024',
        appointmentTime: '2:00 PM',
        service: 'Hot Rock Pedicure',
        duration: '1 hour',
        customerName: 'Emily Chen',
        customerEmail: 'emily@example.com',
        customerPhone: '(555) 987-6543',
        specialRequests: 'First time customer',
        bookingSubmittedAt: '2024-01-11 9:15 AM'
      }
    ];
    
    setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const today = new Date();
    const aptDate = new Date(apt.appointmentDate);
    
    switch (filter) {
      case 'today':
        return aptDate.toDateString() === today.toDateString();
      case 'upcoming':
        return aptDate >= today;
      case 'pending':
        return apt.status === 'PENDING';
      default:
        return true;
    }
  });

  const updateAppointmentStatus = (appointmentId: string, newStatus: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.appointmentId === appointmentId 
          ? { ...apt, status: newStatus }
          : apt
      )
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Dashboard</h1>
            <p className="text-gray-600">Manage your appointments and customer bookings</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'today' | 'upcoming' | 'pending')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Appointments</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
            <h3 className="text-lg font-semibold">Total Appointments</h3>
            <p className="text-2xl font-bold">{appointments.length}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white">
            <h3 className="text-lg font-semibold">Pending</h3>
            <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'PENDING').length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-4 text-white">
            <h3 className="text-lg font-semibold">Confirmed</h3>
            <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'CONFIRMED').length}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg p-4 text-white">
            <h3 className="text-lg font-semibold">This Week</h3>
            <p className="text-2xl font-bold">{appointments.length}</p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No appointments found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'New appointments will appear here'}
              </p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div key={appointment.appointmentId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{appointment.customerName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Service</p>
                        <p className="font-medium">{appointment.service}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date & Time</p>
                        <p className="font-medium">{appointment.appointmentDate}</p>
                        <p className="font-medium">{appointment.appointmentTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Contact</p>
                        <p className="font-medium">{appointment.customerPhone}</p>
                        <p className="font-medium text-blue-600">{appointment.customerEmail}</p>
                      </div>
                    </div>
                    
                    {appointment.specialRequests && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-sm">Special Requests:</p>
                        <p className="text-sm">{appointment.specialRequests}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <select
                      value={appointment.status}
                      onChange={(e) => updateAppointmentStatus(appointment.appointmentId, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`tel:${appointment.customerPhone}`)}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                        title="Call customer"
                      >
                        📞
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${appointment.customerEmail}`)}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                        title="Email customer"
                      >
                        ✉️
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  <p>Appointment ID: {appointment.appointmentId} • Booked: {appointment.bookingSubmittedAt}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 