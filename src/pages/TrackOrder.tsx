import React, { useState } from 'react';
import { Package as PackageIcon, Search, Truck, Ship, Plane } from 'lucide-react';
import type { Package } from '../context/DataContext';
import { packagesAPI } from '../utils/api';
import { normalizeTrackingId } from '../utils/tracking';
import './Pages.css';

const TrackOrder: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [searchedPackage, setSearchedPackage] = useState<Package | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const mapPackage = (p: any): Package => ({
    id: p.id,
    tracking_id: p.trackingId ?? p.tracking_id,
    status: p.status,
    shipping_route: (p.shippingRoute ?? p.shipping_route ?? 'sea') as 'sea' | 'air',
    current_location: p.currentLocation ?? p.current_location ?? '',
    origin: p.origin ?? '',
    destination: p.destination ?? '',
    created_at: p.createdAt ?? p.created_at ?? new Date().toISOString(),
    updated_at: p.updatedAt ?? p.updated_at ?? new Date().toISOString(),
    estimated_delivery: p.estimatedDelivery ?? p.estimated_delivery,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedTrackingId = normalizeTrackingId(trackingId);
    if (!normalizedTrackingId) {
      return;
    }

    setTrackingId(normalizedTrackingId);
    setHasSearched(true);
    setNotFound(false);
    setSearchError('');
    setSearchedPackage(null);
    setIsSearching(true);

    try {
      const pkg = await packagesAPI.getByTrackingId(normalizedTrackingId);
      setSearchedPackage(mapPackage(pkg));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setNotFound(true);
      } else {
        console.error('Tracking lookup failed:', error);
        setSearchError('We could not fetch your tracking details right now. Please try again shortly.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const getShippingIcon = (route?: 'sea' | 'air') => {
    if (!route) return <Truck size={48} color="#2f8f5b" />;
    return route === 'sea' ? <Ship size={48} color="#2f8f5b" /> : <Plane size={48} color="#2f8f5b" />;
  };

  const getProgressPercentage = (status: string) => {
    const statusMap: { [key: string]: number } = {
      'Order Made': 10,
      'Processing': 20,
      'Dispatched from China': 30,
      'In Transit to Ghana': 50,
      'Arrived at Port': 70,
      'Customs Clearance': 80,
      'Out for Delivery': 90,
      'Delivered': 100,
    };
    return statusMap[status] || 0;
  };

  return (
    <div className="page-container">
      <div className="track-order-header" style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        backgroundColor: '#2f8f5b',
        color: 'white',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        <PackageIcon size={64} style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Track Your Order</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
          Enter your tracking ID to see real-time package status
        </p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSearch} style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          alignItems: 'stretch'
        }}>
          <input
            type="text"
            value={trackingId}
            onChange={(e) => {
              setTrackingId(e.target.value);
              setHasSearched(false);
              setNotFound(false);
              setSearchError('');
              setSearchedPackage(null);
            }}
            placeholder="Enter tracking ID (e.g., SEA-123456-ABC789)"
            style={{
              flex: 1,
              padding: '1rem',
              fontSize: '1.1rem',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              fontFamily: 'monospace',
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={isSearching} style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Search size={20} />
            {isSearching ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {searchError && hasSearched && (
          <div style={{
            padding: '2rem',
            backgroundColor: 'rgba(212, 164, 63, 0.1)',
            border: '2px solid rgba(212, 164, 63, 0.25)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#8b6a17', marginBottom: '0.5rem' }}>Tracking Unavailable</h3>
            <p style={{ color: 'var(--text-dark)' }}>{searchError}</p>
          </div>
        )}

        {notFound && hasSearched && (
          <div style={{
            padding: '2rem',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            border: '2px solid rgba(231, 76, 60, 0.3)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#e74c3c', marginBottom: '0.5rem' }}>Package Not Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              No package found with tracking ID: <strong>{trackingId}</strong>
            </p>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Please check your tracking ID and try again.
            </p>
          </div>
        )}

        {searchedPackage && (
          <div style={{
            border: '2px solid var(--border-color)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#1f6d44',
              color: 'white',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              {getShippingIcon(searchedPackage.shipping_route)}
              <h2 style={{ marginTop: '1rem', fontSize: '1.5rem' }}>
                Tracking ID: {searchedPackage.tracking_id}
              </h2>
              <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>
                {searchedPackage.shipping_route === 'sea' ? '🚢 Sea Freight' : '✈️ Air Freight'}
              </p>
            </div>

            {/* Progress Bar */}
            <div style={{ padding: '2rem', backgroundColor: '#f8f9fa' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontWeight: 600 }}>Status: {searchedPackage.status}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {getProgressPercentage(searchedPackage.status)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#d7ebdb',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${getProgressPercentage(searchedPackage.status)}%`,
                    height: '100%',
                    backgroundColor: '#2f8f5b',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div style={{ padding: '2rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}>
                <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    CURRENT LOCATION
                  </h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    📍 {searchedPackage.current_location}
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    ROUTE
                  </h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {searchedPackage.origin} → {searchedPackage.destination}
                  </p>
                </div>

                {searchedPackage.estimated_delivery && (
                  <div>
                    <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      ESTIMATED DELIVERY
                    </h4>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                      📅 {searchedPackage.estimated_delivery}
                    </p>
                  </div>
                )}

                <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    LAST UPDATED
                  </h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    🕐 {new Date(searchedPackage.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{
              padding: '2rem',
              backgroundColor: '#f8f9fa',
              borderTop: '2px solid var(--border-color)'
            }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Shipping Timeline</h3>
              <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                <div style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '0',
                  bottom: '0',
                  width: '2px',
                  backgroundColor: '#2f8f5b'
                }} />
                
                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    backgroundColor: '#2f8f5b',
                    border: '3px solid white',
                    boxShadow: '0 0 0 2px #2f8f5b'
                  }} />
                  <div>
                    <strong>{searchedPackage.status}</strong>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      {searchedPackage.current_location}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {new Date(searchedPackage.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', position: 'relative', opacity: 0.6 }}>
                  <div style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    backgroundColor: '#e0e0e0',
                    border: '3px solid white'
                  }} />
                  <div>
                    <strong>Package Created</strong>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {new Date(searchedPackage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!hasSearched && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-muted)'
          }}>
            <PackageIcon size={80} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>
              Enter your tracking ID above to see your package details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
