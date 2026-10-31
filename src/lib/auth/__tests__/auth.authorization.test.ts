import { describe, it, expect } from 'vitest';
import {
  isStaffOrAdmin,
  canAccessCustomerResource,
  getSessionUser,
  AuthUser,
} from '../session';

describe('Authentication & Authorization Access Controls', () => {
  const adminUser: AuthUser = {
    id: 'usr_admin',
    name: 'Admin Levin',
    email: 'admin@brightloop.com',
    role: 'ADMIN',
  };

  const staffUser: AuthUser = {
    id: 'usr_staff',
    name: 'Staff Joe',
    email: 'joe@brightloop.com',
    role: 'STAFF',
  };

  const customerA: AuthUser = {
    id: 'usr_cust_a',
    name: 'Customer Alice',
    email: 'alice@acme.com',
    role: 'CUSTOMER',
    customerId: 'cust_acme_123',
  };

  const customerB: AuthUser = {
    id: 'usr_cust_b',
    name: 'Customer Bob',
    email: 'bob@globex.com',
    role: 'CUSTOMER',
    customerId: 'cust_globex_456',
  };

  it('should identify staff and admin privileges correctly', () => {
    expect(isStaffOrAdmin(adminUser)).toBe(true);
    expect(isStaffOrAdmin(staffUser)).toBe(true);
    expect(isStaffOrAdmin(customerA)).toBe(false);
    expect(isStaffOrAdmin(null)).toBe(false);
  });

  it('should permit customer to access only their own customer resource', () => {
    expect(canAccessCustomerResource(customerA, 'cust_acme_123')).toBe(true);
    // Customer A cannot access Customer B's resources
    expect(canAccessCustomerResource(customerA, 'cust_globex_456')).toBe(false);
  });

  it('should allow staff and admin to access any customer resource', () => {
    expect(canAccessCustomerResource(adminUser, 'cust_acme_123')).toBe(true);
    expect(canAccessCustomerResource(staffUser, 'cust_globex_456')).toBe(true);
  });

  it('should extract session from request headers correctly', async () => {
    const mockReq = new Request('http://localhost/api/invoices', {
      headers: {
        'x-user-id': 'custom_user_id',
        'x-user-role': 'CUSTOMER',
        'x-customer-id': 'cust_target_999',
        'x-user-email': 'portal@client.com',
      },
    });

    const user = await getSessionUser(mockReq);
    expect(user).not.toBeNull();
    expect(user?.id).toBe('custom_user_id');
    expect(user?.role).toBe('CUSTOMER');
    expect(user?.customerId).toBe('cust_target_999');
    expect(user?.email).toBe('portal@client.com');
  });
});
