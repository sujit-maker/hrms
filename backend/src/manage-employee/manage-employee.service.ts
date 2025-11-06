import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateManageEmployeeDto } from './dto/create-manage-employee.dto';
import { UpdateManageEmployeeDto } from './dto/update-manage-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ManageEmployeeService {
  private readonly SALT_ROUNDS = 12;

  constructor(private prisma: PrismaService) {}

  // Helper method to hash password
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Helper method to verify password (useful for login functionality)
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // CREATE employee with nested rows AND credentials with hashed password
  async create(dto: CreateManageEmployeeDto) {
    const {
      serviceProviderID,
      companyID,
      branchesID,
      contractorID,
      // Extract basic position fields
      departmentNameID,
      designationID,
      managerID,
      employmentType,
      employmentStatus,
      probationPeriod,
      workShiftID,
      attendancePolicyID,
      leavePolicyID,
      salaryPayGradeType,
      monthlyPayGradeID,
      hourlyPayGradeID,
      edu = [],
      exp = [],
      devices = [],
      bankDetails = [],
      promotion,
      ...scalars
    } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Create the employee
      const employee = await tx.manageEmployee.create({
        data: {
          ...scalars,

          // Basic position scalars
          ...(employmentType !== undefined ? { employmentType } : {}),
          ...(employmentStatus !== undefined ? { employmentStatus } : {}),
          ...(probationPeriod !== undefined ? { probationPeriod } : {}),
          ...(salaryPayGradeType !== undefined ? { salaryPayGradeType } : {}),

          // Basic position fields (direct field assignments)
          ...(departmentNameID != null ? { departmentNameID } : {}),
          ...(designationID != null ? { designationID } : {}),
          ...(managerID != null ? { managerID } : {}),
          ...(workShiftID != null ? { workShiftID } : {}),
          ...(attendancePolicyID != null ? { attendancePolicyID } : {}),
          ...(leavePolicyID != null ? { leavePolicyID } : {}),
          ...(monthlyPayGradeID != null ? { monthlyPayGradeID } : {}),
          ...(hourlyPayGradeID != null ? { hourlyPayGradeID } : {}),

          // Foreign key fields
          serviceProviderID: serviceProviderID ?? undefined,
          companyID: companyID ?? undefined,
          branchesID: branchesID ?? undefined,
          contractorID: contractorID ?? undefined,

          // nested creates
          empEduQualification: {
            create: edu.map((e) => ({
              instituteType: e.instituteType ?? null,
              instituteName: e.instituteName ?? null,
              degree: e.degree ?? null,
              pasingYear: e.pasingYear ?? null,
              marks: e.marks ?? null,
              gpaCgpa: e.gpaCgpa ?? null,
              class: e.class ?? null,
            })),
          },
          empProfExprience: {
            create: exp.map((x) => ({
              orgName: x.orgName ?? null,
              designation: x.designation ?? null,
              fromDate: x.fromDate ?? null,
              toDate: x.toDate ?? null,
              responsibility: x.responsibility ?? null,
              skill: x.skill ?? null,
            })),
          },
          empDeviceMapping: {
            create: devices.map((d) => ({
              deviceID: d.deviceID,
              deviceEmpCode: d.deviceEmpCode ?? null,
            })),
          },
          employeeBankDetails: {
            create: bankDetails.map((b) => ({
              bankName: b.bankName ?? null,
              bankBranchName: b.bankBranchName ?? null,
              accNumber: b.accNumber ?? null,
              ifscCode: b.ifscCode ?? null,
              upi: b.upi ?? null,
            })),
          },
        } as any,
      });

      // Create employee credentials automatically with hashed password
      if (scalars.employeeID && scalars.personalPhoneNo) {
        const hashedPassword = await this.hashPassword(scalars.personalPhoneNo);
        
        await tx.employeeCredentials.create({
          data: {
            employeeID: employee.id,
            username: scalars.employeeID,
            password: hashedPassword, // Store hashed password
            serviceProviderID: serviceProviderID ?? undefined,
            companyID: companyID ?? undefined,
            branchesID: branchesID ?? undefined,
          },
        });
      }

      // Return the employee with all relations including credentials
      return tx.manageEmployee.findUnique({
        where: { id: employee.id },
        include: {
          serviceProvider: true,
          company: true,
          branches: true,
          contractors: true,
          employeeCredentials: {
            select: {
              id: true,
              username: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              // Don't include password in response for security
            }
          },
          empEduQualification: true,
          empProfExprience: true,
          employeeBankDetails: true,
          empDeviceMapping: { include: { device: true } },
          empPromotion: {
            orderBy: { id: 'desc' },
            include: {
              departments: true,
              designations: true,
              workShift: true,
              attendancePolicy: true,
              leavePolicy: true,
              hourlyPayGrade: true,
              monthlyPayGrade: true,
            },
          },
        },
      });
    });
  }

  // Fix getAllCredentials - use the same approach as test query
async getAllCredentials() {
  try {
    
    const credentials = await this.prisma.employeeCredentials.findMany({
      include: {
        employee: {
          select: {
            id: true,
            employeeFirstName: true,
            employeeLastName: true,
            employeeID: true,
            personalPhoneNo: true,
            businessEmail: true,
          }
        },
        serviceProvider: {
          select: {
            id: true,
            companyName: true,
          }
        },
        company: {
          select: {
            id: true,
            companyName: true,
          }
        },
        branches: {
          select: {
            id: true,
            branchName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ Found ${credentials.length} credentials`);
    
    // Return the data directly without wrapping in another object
    return credentials;
    
  } catch (error) {
    console.error('❌ Error in getAllCredentials:', error);
    throw new Error(`Failed to fetch credentials: ${error.message}`);
  }
}

 // Fix getEmployeeCredentials - use the same approach as test query
async getEmployeeCredentials(employeeID: number) {
  try {
    console.log(`🔍 Getting credentials for employee ID: ${employeeID}`);
    
    const credentials = await this.prisma.employeeCredentials.findUnique({
      where: { employeeID },
      include: {
        employee: {
          select: {
            id: true,
            employeeFirstName: true,
            employeeLastName: true,
            employeeID: true,
            personalPhoneNo: true,
            businessEmail: true,
          }
        },
        serviceProvider: {
          select: {
            id: true,
            companyName: true,
          }
        },
        company: {
          select: {
            id: true,
            companyName: true,
          }
        },
        branches: {
          select: {
            id: true,
            branchName: true,
          }
        }
      }
    });

    console.log('Credentials found:', credentials);
    
    if (!credentials) {
      return { 
        message: 'No credentials found for this employee',
        employeeID 
      };
    }

    // Return the data directly without wrapping in another object
    return credentials;
    
  } catch (error) {
    console.error('❌ Error in getEmployeeCredentials:', error);
    throw new Error(`Failed to fetch employee credentials: ${error.message}`);
  }
}





// Fix getCredentialsByUsername
async getCredentialsByUsername(username: string) {
  return this.prisma.employeeCredentials.findFirst({
    where: { username },
    include: {
      employee: {
        select: {
          id: true,
          employeeFirstName: true,
          employeeLastName: true,
          employeeID: true,
          personalPhoneNo: true,
          businessEmail: true,
        }
      },
      serviceProvider: {
        select: {
          id: true,
          companyName: true,
        }
      },
      company: {
        select: {
          id: true,
          companyName: true,
        }
      },
      branches: {
        select: {
          id: true,
          branchName: true,
        }
      }
    }
  });
}



// Search credentials with filters
// Fix searchCredentials
async searchCredentials(filters: {
  username?: string;
  isActive?: boolean;
  serviceProviderID?: number;
  companyID?: number;
  branchesID?: number;
}) {
  return this.prisma.employeeCredentials.findMany({
    where: {
      ...(filters.username && { 
        username: { contains: filters.username, mode: 'insensitive' } 
      }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.serviceProviderID && { serviceProviderID: filters.serviceProviderID }),
      ...(filters.companyID && { companyID: filters.companyID }),
      ...(filters.branchesID && { branchesID: filters.branchesID }),
    },
    include: {
      employee: {
        select: {
          id: true,
          employeeFirstName: true,
          employeeLastName: true,
          employeeID: true,
          personalPhoneNo: true,
          businessEmail: true,
        }
      },
      serviceProvider: {
        select: {
          id: true,
         companyName: true,
        }
      },
      company: {
        select: {
          id: true,
          companyName: true,
        }
      },
      branches: {
        select: {
          id: true,
          branchName: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Reset password to personal phone number
async resetPassword(employeeID: number) {
  const employee = await this.prisma.manageEmployee.findUnique({
    where: { id: employeeID },
    select: { personalPhoneNo: true, employeeID: true }
  });

  if (!employee) {
    throw new Error('Employee not found');
  }

  if (!employee.personalPhoneNo) {
    throw new Error('Personal phone number not set for this employee');
  }

  const hashedPassword = await this.hashPassword(employee.personalPhoneNo);

  return this.prisma.employeeCredentials.update({
    where: { employeeID },
    data: {
      password: hashedPassword,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      username: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    }
  });
}


  // Method to update credentials separately with password hashing
  async updateCredentials(employeeID: number, data: { username?: string; password?: string; isActive?: boolean }) {
    const updateData: any = { ...data };

    // Hash password if provided
    if (data.password) {
      updateData.password = await this.hashPassword(data.password);
    }

    return this.prisma.employeeCredentials.update({
      where: { employeeID },
      data: updateData,
      select: {
        id: true,
        username: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Don't return password
      }
    });
  }

  // Method for employee login verification
  async verifyEmployeeLogin(username: string, password: string) {
    const credentials = await this.prisma.employeeCredentials.findFirst({
      where: { 
        username,
        isActive: true 
      },
      include: {
        employee: {
          include: {
            serviceProvider: true,
            company: true,
            branches: true,
            departments: true,
            designations: true,
          }
        }
      }
    });

    if (!credentials) {
      return null;
    }

    const isPasswordValid = await this.verifyPassword(password, credentials.password);
    
    if (!isPasswordValid) {
      return null;
    }

    // Return employee data without password
    const { password: _, ...credentialsWithoutPassword } = credentials;
    return credentialsWithoutPassword;
  }

  findAll() {
    return this.prisma.manageEmployee.findMany({
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        contractors: true,
        employeeCredentials: {
          select: {
            id: true,
            username: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            // Don't include password in response
          }
        },
        // Basic position relations
        departments: true,
        designations: true,
        manager: true,
        workShift: true,
        employeeBankDetails: true,
        attendancePolicy: true,
        leavePolicy: true,
        monthlyPayGrade: true,
        hourlyPayGrade: true,
        empEduQualification: true,
        empProfExprience: true,
        empDeviceMapping: { include: { device: true } },
        empPromotion: {
          orderBy: { id: 'desc' },
          include: {
            departments: true,
            designations: true,
            workShift: true,
            attendancePolicy: true,
            leavePolicy: true,
            hourlyPayGrade: true,
            monthlyPayGrade: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.manageEmployee.findUnique({
      where: { id },
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        contractors: true,
        employeeCredentials: {
          select: {
            id: true,
            username: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            // Don't include password in response
          }
        },
        // Basic position relations
        departments: true,
        designations: true,
        employeeBankDetails: true,
        manager: true,
        workShift: true,
        attendancePolicy: true,
        leavePolicy: true,
        monthlyPayGrade: true,
        hourlyPayGrade: true,
        empEduQualification: true,
        empProfExprience: true,
        empDeviceMapping: { include: { device: true } },
        empPromotion: {
          orderBy: { id: 'desc' },
          include: {
            departments: true,
            designations: true,
            workShift: true,
            attendancePolicy: true,
            leavePolicy: true,
            hourlyPayGrade: true,
            monthlyPayGrade: true,
          },
        },
      },
    });
  }

  async update(id: number, dto: UpdateManageEmployeeDto) {
    const {
      serviceProviderID,
      companyID,
      branchesID,
      contractorID,
      // Extract basic position fields
      departmentNameID,
      designationID,
      managerID,
      employmentType,
      bankDetails,
      employmentStatus,
      probationPeriod,
      workShiftID,
      attendancePolicyID,
      leavePolicyID,
      salaryPayGradeType,
      monthlyPayGradeID,
      hourlyPayGradeID,
      edu,
      exp,
      devices,
      promotion,
      eduIdsToDelete = [],
      expIdsToDelete = [],
      deviceMapIdsToDelete = [],
      bankDetailsIdsToDelete = [],
      ...scalars
    } = dto;

    return this.prisma.$transaction(async (tx) => {

      delete (scalars as any).bankDetailsIdsToDelete;
      delete (scalars as any).bankDetailIdsToDelete;

      // 1) update parent scalars + relations
      await tx.manageEmployee.update({
        where: { id },
        data: {
          ...scalars,

          // Basic position scalars
          ...(employmentType !== undefined ? { employmentType } : {}),
          ...(employmentStatus !== undefined ? { employmentStatus } : {}),
          ...(probationPeriod !== undefined ? { probationPeriod } : {}),
          ...(salaryPayGradeType !== undefined ? { salaryPayGradeType } : {}),

          // Basic position fields (direct field assignments)
          ...(departmentNameID !== undefined ? { departmentNameID } : {}),
          ...(designationID !== undefined ? { designationID } : {}),
          ...(managerID !== undefined ? { managerID } : {}),
          ...(workShiftID !== undefined ? { workShiftID } : {}),
          ...(attendancePolicyID !== undefined ? { attendancePolicyID } : {}),
          ...(leavePolicyID !== undefined ? { leavePolicyID } : {}),
          ...(monthlyPayGradeID !== undefined ? { monthlyPayGradeID } : {}),
          ...(hourlyPayGradeID !== undefined ? { hourlyPayGradeID } : {}),

          // Foreign key fields
          serviceProviderID: serviceProviderID ?? undefined,
          companyID: companyID ?? undefined,
          branchesID: branchesID ?? undefined,
          contractorID: contractorID ?? undefined,
        } as any,
      });

      // Update employee credentials if employeeID or personalPhoneNo changed
      if (scalars.employeeID || scalars.personalPhoneNo) {
        const existingEmployee = await tx.manageEmployee.findUnique({
          where: { id },
          select: { employeeID: true, personalPhoneNo: true }
        });

        const currentCredentials = await tx.employeeCredentials.findUnique({
          where: { employeeID: id }
        });

        if (currentCredentials) {
          const updateData: any = {
            serviceProviderID: serviceProviderID ?? undefined,
            companyID: companyID ?? undefined,
            branchesID: branchesID ?? undefined,
          };

          // Update username if employeeID changed
          if (scalars.employeeID) {
            updateData.username = scalars.employeeID;
          }

          // Update password if personalPhoneNo changed (with hashing)
          if (scalars.personalPhoneNo) {
            updateData.password = await this.hashPassword(scalars.personalPhoneNo);
          }

          await tx.employeeCredentials.update({
            where: { employeeID: id },
            data: updateData,
          });
        } else if (scalars.employeeID && scalars.personalPhoneNo) {
          // Create credentials if they don't exist but now we have the required data
          const hashedPassword = await this.hashPassword(scalars.personalPhoneNo);
          
          await tx.employeeCredentials.create({
            data: {
              employeeID: id,
              username: scalars.employeeID,
              password: hashedPassword,
              serviceProviderID: serviceProviderID ?? undefined,
              companyID: companyID ?? undefined,
              branchesID: branchesID ?? undefined,
            },
          });
        }
      }

      // ... rest of your existing update logic (delete children, upsert edu, exp, devices, bankDetails, promotion)
      // [Keep all your existing update logic for other relations here]
      // 2) delete removed children
      if (eduIdsToDelete.length) {
        await tx.empEduQualification.deleteMany({
          where: { id: { in: eduIdsToDelete }, manageEmployeeID: id },
        });
      }
      if (expIdsToDelete.length) {
        await tx.empProfExprience.deleteMany({
          where: { id: { in: expIdsToDelete }, manageEmployeeID: id },
        });
      }
      if (deviceMapIdsToDelete.length) {
        await tx.empDeviceMapping.deleteMany({
          where: { id: { in: deviceMapIdsToDelete }, manageEmployeeID: id },
        });
      }

      // 3) upsert edu
      if (edu?.length) {
        const toUpdate = edu.filter((e) => !!e.id);
        const toCreate = edu.filter((e) => !e.id);
        for (const e of toUpdate) {
          await tx.empEduQualification.update({
            where: { id: e.id! },
            data: {
              instituteType: e.instituteType ?? null,
              instituteName: e.instituteName ?? null,
              degree: e.degree ?? null,
              pasingYear: e.pasingYear ?? null,
              marks: e.marks ?? null,
              gpaCgpa: e.gpaCgpa ?? null,
              class: e.class ?? null,
            },
          });
        }
        if (toCreate.length) {
          await tx.empEduQualification.createMany({
            data: toCreate.map((e) => ({
              manageEmployeeID: id,
              instituteType: e.instituteType ?? null,
              instituteName: e.instituteName ?? null,
              degree: e.degree ?? null,
              pasingYear: e.pasingYear ?? null,
              marks: e.marks ?? null,
              gpaCgpa: e.gpaCgpa ?? null,
              class: e.class ?? null,
            })),
          });
        }
      }

      // 4) upsert exp
      if (exp?.length) {
        const toUpdate = exp.filter((x) => !!x.id);
        const toCreate = exp.filter((x) => !x.id);
        for (const x of toUpdate) {
          await tx.empProfExprience.update({
            where: { id: x.id! },
            data: {
              orgName: x.orgName ?? null,
              designation: x.designation ?? null,
              fromDate: x.fromDate ?? null,
              toDate: x.toDate ?? null,
              responsibility: x.responsibility ?? null,
              skill: x.skill ?? null,
            },
          });
        }
        if (toCreate.length) {
          await tx.empProfExprience.createMany({
            data: toCreate.map((x) => ({
              manageEmployeeID: id,
              orgName: x.orgName ?? null,
              designation: x.designation ?? null,
              fromDate: x.fromDate ?? null,
              toDate: x.toDate ?? null,
              responsibility: x.responsibility ?? null,
              skill: x.skill ?? null,
            })),
          });
        }
      }

      // 5) upsert devices
      if (devices?.length) {
        const toUpdate = devices.filter((d) => !!d.id);
        const toCreate = devices.filter((d) => !d.id);
        for (const d of toUpdate) {
          await tx.empDeviceMapping.update({
            where: { id: d.id! },
            data: {
              device: { connect: { id: d.deviceID } },
              deviceEmpCode: d.deviceEmpCode ?? null,
            },
          });
        }
        for (const d of toCreate) {
          await tx.empDeviceMapping.create({
            data: {
              manageEmployee: { connect: { id } },
              device: { connect: { id: d.deviceID } },
              deviceEmpCode: d.deviceEmpCode ?? null,
            },
          });
        }
      }

      // 6) upsert bank details
      if (bankDetails?.length) {
        const toUpdate = bankDetails.filter((b) => !!b.id);
        const toCreate = bankDetails.filter((b) => !b.id);

        // Update existing
        for (const b of toUpdate) {
          await tx.employeeBankDetails.update({
            where: { id: b.id! },
            data: {
              bankName: b.bankName ?? null,
              bankBranchName: b.bankBranchName ?? null,
              accNumber: b.accNumber ?? null,
              ifscCode: b.ifscCode ?? null,
              upi: b.upi ?? null,
            },
          });
        }

        // Create new
        if (toCreate.length) {
          await tx.employeeBankDetails.createMany({
            data: toCreate.map((b) => ({
              employeeID: id,
              bankName: b.bankName ?? null,
              bankBranchName: b.bankBranchName ?? null,
              accNumber: b.accNumber ?? null,
              ifscCode: b.ifscCode ?? null,
              upi: b.upi ?? null,
            })),
          });
        }
      }

      // Delete removed bank details
      if (bankDetailsIdsToDelete.length) {
        await tx.employeeBankDetails.deleteMany({
          where: { id: { in: bankDetailsIdsToDelete }, employeeID: id },
        });
      }

      if (promotion) {
        if (promotion.id) {
          await tx.empPromotion.update({
            where: { id: promotion.id },
            data: {
              departmentNameID: promotion.departmentNameID ?? null,
              designationID: promotion.designationID ?? null,
              managerID: promotion.managerID ?? null,
              employmentType: promotion.employmentType ?? null,
              employmentStatus: promotion.employmentStatus ?? null,
              probationPeriod: promotion.probationPeriod ?? null,
              workShiftID: promotion.workShiftID ?? null,
              attendancePolicyID: promotion.attendancePolicyID ?? null,
              leavePolicyID: promotion.leavePolicyID ?? null,
              salaryPayGradeType: promotion.salaryPayGradeType ?? null,
              monthlyPayGradeID: promotion.monthlyPayGradeID ?? null,
              hourlyPayGradeID: promotion.hourlyPayGradeID ?? null,
            },
          });
        } else {
          await tx.empPromotion.create({
            data: {
              manageEmployeeID: id,
              departmentNameID: promotion.departmentNameID ?? null,
              designationID: promotion.designationID ?? null,
              managerID: promotion.managerID ?? null,
              employmentType: promotion.employmentType ?? null,
              employmentStatus: promotion.employmentStatus ?? null,
              probationPeriod: promotion.probationPeriod ?? null,
              workShiftID: promotion.workShiftID ?? null,
              attendancePolicyID: promotion.attendancePolicyID ?? null,
              leavePolicyID: promotion.leavePolicyID ?? null,
              salaryPayGradeType: promotion.salaryPayGradeType ?? null,
              monthlyPayGradeID: promotion.monthlyPayGradeID ?? null,
              hourlyPayGradeID: promotion.hourlyPayGradeID ?? null,
            },
          });
        }
      }

      // 7) return fresh data with credentials (excluding password)
      return tx.manageEmployee.findUnique({
        where: { id },
        include: {
          serviceProvider: true,
          company: true,
          branches: true,
          contractors: true,
          employeeCredentials: {
            select: {
              id: true,
              username: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            }
          },
          // Basic position relations
          departments: true,
          designations: true,
          manager: true,
          workShift: true,
          attendancePolicy: true,
          leavePolicy: true,
          monthlyPayGrade: true,
          hourlyPayGrade: true,
          employeeBankDetails: true,
          empEduQualification: true,
          empProfExprience: true,
          empDeviceMapping: { include: { device: true } },
          empPromotion: {
            orderBy: { id: 'desc' },
            include: {
              departments: true,
              designations: true,
              workShift: true,
              attendancePolicy: true,
              leavePolicy: true,
              hourlyPayGrade: true,
              monthlyPayGrade: true,
            },
          },
        },
      });
    });
  }

  

  async remove(id: number) {
    try {
      await this.prisma.$transaction([
        // Delete employee credentials first (due to unique constraint)
        this.prisma.employeeCredentials.deleteMany({
          where: { employeeID: id },
        }),

        // Then delete all other related records (your existing delete logic)
        this.prisma.empDeviceMapping.deleteMany({
          where: { manageEmployeeID: id },
        }),
        this.prisma.empProfExprience.deleteMany({
          where: { manageEmployeeID: id },
        }),
        this.prisma.empEduQualification.deleteMany({
          where: { manageEmployeeID: id },
        }),
        this.prisma.empCurrentPosition.deleteMany({
          where: { manageEmployeeID: id },
        }),
        this.prisma.promotionRequest.deleteMany({
          where: { manageEmployeeID: id },
        }),
        this.prisma.empPromotion.deleteMany({
          where: { manageEmployeeID: id },
        }),
        this.prisma.employeeBankDetails.deleteMany({
          where: { employeeID: id },
        }),
        this.prisma.empAttendanceRegularise.deleteMany({
          where: { manageEmployeeID: id },
        }),
        this.prisma.empFieldSiteAttendance.deleteMany({
          where: { manageEmployeeID: id },
        }),
        this.prisma.genarateBonus.deleteMany({
          where: { manageEmployeeID: id },
        }),
        this.prisma.leaveApplication.deleteMany({
          where: { manageEmployeeID: id },
        }),
        this.prisma.bonusAllocation.deleteMany({ where: { employeeID: id } }),

        // Finally delete the ManageEmployee record
        this.prisma.manageEmployee.delete({ where: { id } }),
      ]);
      return { success: true };
    } catch (e: any) {
      if (e?.code === 'P2003') {
        throw new Error(
          'Cannot delete employee: related records exist (education/experience/mappings/etc).',
        );
      }
      throw e;
    }
  }

 
}