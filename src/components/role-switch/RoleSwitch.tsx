"use client"

import { UserType } from "@prisma/client"; 

interface RoleSwitchProps {
  userType: UserType;
  switchRole: (newRole: UserType) => void;
}

export default function RoleSwitch({ userType, switchRole }: RoleSwitchProps) {
  const isSitter = userType === UserType.PETSITTER;

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    // When checked, we're in PETSITTER mode; when unchecked, PETOWNER
    switchRole(e.target.checked ? UserType.PETSITTER : UserType.PETOWNER);
  };

  return (
    <div className="flex items-center gap-4">
      <span className={`${isSitter ? "text-gray-500" : "text-black"} font-medium`}>
        Pet Owner
      </span>

      <label className="relative inline-block w-12 h-6">
        <input
          type="checkbox"
          className="opacity-0 w-0 h-0"
          checked={isSitter}
          onChange={handleToggle}
        />
        <span className="absolute inset-0 bg-gray-300 rounded-full transition-colors duration-300"></span>
        <span
          className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
            isSitter ? "translate-x-6" : "translate-x-0"
          }`}
        ></span>
      </label>

      <span className={`${isSitter ? "text-black" : "text-gray-500"} font-medium`}>
        Pet Sitter
      </span>
    </div>
  );
}
