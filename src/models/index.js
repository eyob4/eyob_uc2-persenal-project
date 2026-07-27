// Side-effect-only imports: guarantees every Mongoose model is registered
// before any populate() call runs, regardless of which route handles the
// request first. Import this (for its side effects) from lib/mongodb.js.
import "@/models/User";
import "@/models/Student";
import "@/models/Teacher";
import "@/models/Parent";
import "@/models/Class";
import "@/models/Subject";
import "@/models/Attendance";
import "@/models/Grade";
import "@/models/Fee";
import "@/models/Announcement";
import "@/models/Message";
import "@/models/PasswordResetToken";
