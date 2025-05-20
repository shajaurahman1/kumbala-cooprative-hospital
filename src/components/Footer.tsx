
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-hospital-800 text-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Kumbala Cooperative Hospital</h3>
            <p className="text-hospital-100 mb-4">
              Providing quality healthcare services to our community since 1995.
              Our mission is to deliver compassionate care with modern medical expertise.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Contact Us</h3>
            <address className="not-italic text-hospital-100">
              <p>123 Medical Avenue</p>
              <p>Kumbala City, KA 56789</p>
              <p className="mt-2">Email: info@kumbala-hospital.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Hours of Operation</h3>
            <div className="text-hospital-100">
              <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
              <p>Saturday: 8:00 AM - 6:00 PM</p>
              <p>Sunday: 10:00 AM - 4:00 PM</p>
              <p className="mt-2">Emergency: 24/7</p>
            </div>
          </div>
        </div>

        <div className="border-t border-hospital-600 mt-8 pt-8 text-center text-hospital-200">
          <p>© 2023 Kumbala Cooperative Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
